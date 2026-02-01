'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Wheat, Droplet, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <div className="bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-light.png"
              alt="Shah Distributors"
              width={160}
              height={40}
              className="object-contain h-10 w-auto"
              priority
            />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm hover:text-amber-400 transition">Products</a>
            <a href="#features" className="text-sm hover:text-amber-400 transition">Features</a>
            <a href="#contact" className="text-sm hover:text-amber-400 transition">Contact</a>
          </div>
          <a
            href="https://wa.me/923334445566"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-24 px-6 flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            style={{
              top: '10%',
              left: '5%',
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          />
          <div
            className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
            style={{
              top: '40%',
              right: '5%',
              transform: `translateY(${scrollY * -0.3}px)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quality You Can Trust
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Premium <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Grains
              </span>
              <br />
              Trusted Quality
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Shah Distributors provides the finest rice and wheat flour sourced directly from the best farms. Perfect for wholesalers and retailers looking for premium quality grains with wholesale pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/923334445566"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition hover:shadow-lg hover:shadow-amber-500/20"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
              <Link
                href="/login"
                className="border border-amber-500/30 hover:border-amber-500/60 px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition hover:bg-amber-500/5"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="relative h-96 md:h-full">
            <div
              className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl blur-2xl"
              style={{
                transform: `translateY(${scrollY * 0.2}px)`,
              }}
            />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden h-full flex items-center justify-center">
              <Image
                src="/products/wheat-flour.jpg"
                alt="Premium Wheat Flour"
                width={400}
                height={500}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Our Premium Products</h2>
            <p className="text-xl text-slate-400">Carefully selected and processed for excellence</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Rice Product */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 group-hover:border-amber-500/50 rounded-2xl overflow-hidden transition">
                <div className="w-full h-64 relative mb-4">
                  <Image
                    src="/products/rice.jpg"
                    alt="Premium Basmati Rice"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3">Premium Basmati Rice</h3>
                  <p className="text-slate-400 mb-6">
                    Long-grain rice variety sourced from the finest farms. Perfect for both retail and wholesale operations with consistent quality.
                  </p>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-sm text-amber-400">Basmati Grade</span>
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-sm text-amber-400">Premium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wheat Flour Product */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 group-hover:border-amber-500/50 rounded-2xl overflow-hidden transition">
                <div className="w-full h-64 relative mb-4">
                  <Image
                    src="/products/wheat-flour.jpg"
                    alt="Premium Wheat Flour"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3">Premium Wheat Flour</h3>
                  <p className="text-slate-400 mb-6">
                    Freshly milled whole wheat flour with superior protein content. Ideal for bakeries and food manufacturers seeking consistency.
                  </p>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-sm text-amber-400">Whole Wheat</span>
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-sm text-amber-400">Fresh Milled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-slate-400">Excellence in every grain</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quality Assured',
                description: 'Every batch is tested for purity and grade standards',
                icon: '✓',
              },
              {
                title: 'Direct Sourcing',
                description: 'We work directly with farmers to ensure premium quality',
                icon: '🌾',
              },
              {
                title: 'Wholesale Pricing',
                description: 'Competitive rates for bulk orders and regular customers',
                icon: '💰',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-8 hover:border-amber-500/30 transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: 'Years Experience', value: '15+' },
              { label: 'Happy Customers', value: '500+' },
              { label: 'Tons Supplied', value: '1000+' },
              { label: 'Quality Score', value: '98%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">{stat.value}</div>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Partner with Us?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join hundreds of retailers and wholesalers who trust us for premium quality grains.
          </p>
          <a
            href="https://wa.me/923334445566"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition hover:shadow-lg hover:shadow-amber-500/20 mx-auto"
          >
            <MessageCircle className="w-5 h-5" />
            Start Conversation
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <Image
                src="/logo-light.png"
                alt="Shah Distributors"
                width={140}
                height={40}
                className="object-contain h-10 w-auto mb-4"
              />
              <p className="text-slate-400 text-sm">
                Quality grains for your business needs.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#products" className="hover:text-amber-400 transition">Products</a></li>
                <li><a href="#features" className="hover:text-amber-400 transition">Features</a></li>
                <li><a href="#contact" className="hover:text-amber-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-slate-400 text-sm mb-2">
                <a href="https://wa.me/923334445566" className="hover:text-amber-400 transition">
                  WhatsApp: +92 333 4445566
                </a>
              </p>
              <p className="text-slate-400 text-sm">
                Pakistan
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 text-sm">
              © 2025 Premium Grains. All rights reserved.
            </p>
            <Link
              href="/login"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-2 rounded-lg font-semibold text-sm transition"
            >
              Dashboard Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
