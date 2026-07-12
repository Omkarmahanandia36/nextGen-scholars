'use client'; // v2 - original UI restored

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import ScheduleMeetingModal from '../modals/ScheduleMeetingModal';
import PrivacyPolicyModal from '../modals/PrivacyPolicyModal';
import TermsOfServiceModal from '../modals/TermsOfServiceModal';

const Footer = () => {
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
        setIsError(false);
      } else {
        setMessage(data.error || 'Failed to subscribe');
        setIsError(true);
      }
    } catch {
      setMessage('An error occurred. Please try again later.');
      setIsError(true);
    } finally {
      setLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <>
      <div className="w-full px-4 py-8">
        <footer className="max-w-6xl mx-auto rounded-3xl bg-[#0b1329] overflow-hidden border border-gray-800/10">
          <div className="relative">
            {/* Background Gradients */}
            <div className="absolute inset-0">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute top-1/2 -left-24 w-48 h-48 bg-teal-500 rounded-full opacity-20 blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-12 sm:px-8 lg:px-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Company Info */}
                <div className="space-y-4">
                  <Link href="/" className="flex items-center gap-2">
                    <Image 
                      src="/images/logo.png" 
                      alt="NextGen Scholars Logo" 
                      width={36} 
                      height={36} 
                      className="rounded-[12px] object-cover"
                    />
                    <strong className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent inline-block">
                      NextGen Scholars
                    </strong>
                  </Link>
                  <p className="text-gray-400">
                    Transforming education through innovative teaching methods and personalized learning experiences.
                  </p>
                  <div className="flex space-x-4">
                    <SocialLink href="https://twitter.com/nextgenscholar" icon={<FaTwitter size={16} />} />
                    <SocialLink href="https://facebook.com/nextgenscholar" icon={<FaFacebook size={16} />} />
                    <SocialLink href="https://instagram.com/nextgenscholar" icon={<FaInstagram size={16} />} />
                    <SocialLink href="https://linkedin.com/company/nextgenscholar" icon={<FaLinkedin size={16} />} />
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
                  <ul className="space-y-3">
                    <FooterLink href="/" text="Home" />
                    <FooterLink href="/courses" text="Courses" />
                    <FooterLink href="/tutors" text="Tutors" />
                    <FooterLink href="/about" text="About Us" />
                    <FooterLink href="/admin/dashboard" text="Admin" />
                    <li>
                      <button
                        onClick={() => setIsMeetingModalOpen(true)}
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        Contact
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center">
                      <span className="mr-2">📍</span>
                      Bhubaneswar, India
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">📧</span>
                      <a href="mailto:nextgenscholar02@gmail.com" className="hover:text-white transition-colors">
                        nextgenscholar02@gmail.com
                      </a>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">📱</span>
                      <a href="tel:+918280807595" className="hover:text-white transition-colors">
                        +91 8280807595
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Newsletter */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-6">Stay Updated</h4>
                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      {loading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                  {message && (
                    <p className={`mt-3 text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>
                      {message}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-gray-500">
                    Get the latest updates and offers
                  </p>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="mt-12 pt-8 border-t border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <p className="text-gray-400 text-sm">
                    {new Date().getFullYear()} NextGen Scholar. All rights reserved.
                  </p>
                  <div className="flex space-x-6">
                    <button
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Privacy Policy
                    </button>
                    <button
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Terms of Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ScheduleMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
};

const FooterLink = ({ href, text }: { href: string; text: string }) => (
  <li>
    <Link
      href={href}
      className="text-gray-400 hover:text-white transition-colors duration-300"
    >
      {text}
    </Link>
  </li>
);

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
};

export default Footer;
