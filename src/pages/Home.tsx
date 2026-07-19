import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import {
  ShoppingBagIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: ShoppingBagIcon,
      title: "Discover Products",
      description:
        "Browse through thousands of high-quality products from trusted brands.",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: ChartBarIcon,
      title: "Earn Commissions",
      description:
        "Share affiliate links and earn competitive commissions on every sale.",
      color: "text-teal-500",
      bg: "bg-teal-50",
    },
    {
      icon: UserGroupIcon,
      title: "Grow Your Network",
      description:
        "Build your affiliate network and maximize your earning potential.",
      color: "text-lime-500",
      bg: "bg-lime-50",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Products" },
    { value: "5K+", label: "Happy Affiliates" },
    { value: "50K+", label: "Successful Sales" },
    { value: "₹10M+", label: "Total Commissions" },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Affiliate Marketer",
      content:
        "AffiliateSarthi has transformed my business. The platform is intuitive and the commissions are great!",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Product Influencer",
      content:
        "I love the variety of products available. My audience appreciates the quality and my earnings have grown.",
      rating: 5,
    },
    {
      name: "Amit Kumar",
      role: "Digital Entrepreneur",
      content:
        "The best affiliate platform I've worked with. The support team is amazing and the tools are top-notch.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Earn More with{" "}
                <span className="text-lime-300">AffiliateSarthi</span>
              </h1>
              <p className="text-xl text-emerald-50 mb-8 max-w-lg">
                Discover amazing products, share affiliate links, and earn
                commissions effortlessly. Join thousands of successful
                affiliates today!
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link to="/products">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white text-emerald-700 hover:bg-gray-100"
                    >
                      <ShoppingBagIcon className="h-5 w-5 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="bg-white text-emerald-700 hover:bg-gray-100"
                      >
                        <RocketLaunchIcon className="h-5 w-5 mr-2" />
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white/20"
                      >
                        Login
                      </Button>
                    </Link>
                  </>
                )}
                <Link to="/products">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/20"
                  >
                    Explore Products
                  </Button>
                </Link>
              </div>
              {isAuthenticated && (
                <div className="mt-4 text-sm text-emerald-50">
                  Welcome back,{" "}
                  <span className="font-semibold">{user?.name}</span>! 👋
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop"
                  alt="Affiliate Marketing"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose{" "}
              <span className="text-emerald-600">AffiliateSarthi</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in affiliate marketing, all in one
              place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div
                  className={`${feature.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Affiliates Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from successful affiliates who are earning with
              AffiliateSarthi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Join AffiliateSarthi today and start your journey to financial
            freedom.
          </p>
          {!isAuthenticated && (
            <Link to="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100"
              >
                <RocketLaunchIcon className="h-5 w-5 mr-2" />
                Join Now - It's Free
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
