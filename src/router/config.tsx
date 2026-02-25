import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/feature/ProtectedRoute';

const Home = lazy(() => import('../pages/home/page'));
const About = lazy(() => import('../pages/about/page'));
const Services = lazy(() => import('../pages/services/page'));
const ServiceDetail = lazy(() => import('../pages/service-detail/page'));
const Blog = lazy(() => import('../pages/blog/page'));
const BlogDetail = lazy(() => import('../pages/blog-detail/page'));
const Admin = lazy(() => import('../pages/admin/page'));
const Login = lazy(() => import('../pages/login/page'));
const Contact = lazy(() => import('../pages/contact/page'));
// const Testimonials = lazy(() => import('../pages/testimonials/page'));
const FAQs = lazy(() => import('../pages/faqs/page'));
const Products = lazy(() => import('../pages/products/page'));
const ProductDetail = lazy(() => import('../pages/product-detail/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/services',
    element: <Services />,
  },
  {
    path: '/services/:serviceId',
    element: <ServiceDetail />,
  },
  {
    path: '/service-detail/:serviceId',
    element: <ServiceDetail />,
  },
  {
    path: '/products',
    element: <Products />,
  },
  {
    path: '/product/:id',
    element: <ProductDetail />,
  },
  {
    path: '/blog',
    element: <Blog />,
  },
  {
    path: '/blog/:id',
    element: <BlogDetail />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  // {
  //   path: '/testimonials',
  //   element: <Testimonials />,
  // },
  {
    path: '/faqs',
    element: <FAQs />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
