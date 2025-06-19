
-- Create company table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'guest');

-- Create user_profiles table with company association and roles
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'guest',
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add company_id to existing tables for multi-tenancy
ALTER TABLE public.products ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.units ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.sales ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.purchases ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.sales_returns ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Update existing tables RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid()
$$;

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = required_role
  )
$$;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.user_has_role('super_admin')
$$;

-- RLS Policies for companies
CREATE POLICY "Super admins can manage all companies" ON public.companies
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view their company" ON public.companies
  FOR SELECT TO authenticated
  USING (id = public.get_user_company_id());

-- RLS Policies for user_profiles
CREATE POLICY "Super admins can manage all user profiles" ON public.user_profiles
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Company admins can manage their company users" ON public.user_profiles
  FOR ALL TO authenticated
  USING (
    company_id = public.get_user_company_id() 
    AND (
      public.user_has_role('admin') 
      OR public.user_has_role('super_admin')
    )
  )
  WITH CHECK (
    company_id = public.get_user_company_id() 
    AND (
      public.user_has_role('admin') 
      OR public.user_has_role('super_admin')
    )
  );

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for products (company-specific)
CREATE POLICY "Users can access their company products" ON public.products
  FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- RLS Policies for categories (company-specific)
CREATE POLICY "Users can access their company categories" ON public.categories
  FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- RLS Policies for units (company-specific)
CREATE POLICY "Users can access their company units" ON public.units
  FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- RLS Policies for sales (company-specific)
CREATE POLICY "Users can access their company sales" ON public.sales
  FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- RLS Policies for purchases (company-specific)
CREATE POLICY "Users can access their company purchases" ON public.purchases
  FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- RLS Policies for sales_returns (company-specific)
CREATE POLICY "Users can access their company sales returns" ON public.sales_returns
  FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    'guest'::user_role
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
