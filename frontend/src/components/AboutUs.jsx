"use client"

import React from 'react';
import Image from '../Asset/IMAGE.jpeg';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">About Nael Productions</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted source for high-quality content and innovative publishing solutions.
        </p>
      </div>

      {/* Company Overview */}
      <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 2015, Nael Productions began as a small creative studio with a passion for storytelling. 
            Today, we've grown into a leading blog publisher, delivering engaging content to millions of readers worldwide.
          </p>
          <p className="text-gray-600 mb-4">
            Our mission is to create content that informs, inspires, and entertains while maintaining the highest 
            standards of journalistic integrity and creative excellence.
          </p>
          <p className="text-gray-600">
            With a team of talented writers, editors, and designers, we produce content across various niches including 
            technology, lifestyle, business, and culture.
          </p>
        </div>
        <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
          {/* <Image 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
            alt="Nael Productions Team"
            fill
            className="object-cover"
          /> */}
        </div>
      </div>

      {/* Founder Section */}
      <div className="bg-gray-50 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Meet Our Founder</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-48 h-48 rounded-full overflow-hidden shrink-0">
            {/* <Image 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a" 
              alt="Nael, Founder of Nael Productions"
              fill
              className="object-cover"
            /> */}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Nael</h3>
            <p className="text-green-600 font-medium mb-4">Founder & CEO</p>
            <p className="text-gray-600 mb-4">
              With over 15 years of experience in media and publishing, Nael founded Nael Productions with a vision 
              to create a platform that elevates quality content and supports talented creators.
            </p>
            <p className="text-gray-600">
              "Our goal has always been to build bridges between great ideas and the audiences who need them. 
              Every story we publish is an opportunity to make that connection."
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Quality Content",
              description: "We prioritize accuracy, depth, and originality in every piece we publish."
            },
            {
              title: "Innovation",
              description: "Constantly evolving our approach to meet the changing needs of our audience."
            },
            {
              title: "Integrity",
              description: "Honest, transparent, and ethical in all our publishing practices."
            },
            {
              title: "Community",
              description: "Building meaningful connections between creators and readers."
            },
            {
              title: "Diversity",
              description: "Celebrating diverse voices and perspectives in our content."
            },
            {
              title: "Sustainability",
              description: "Committed to environmentally responsible publishing practices."
            }
          ].map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 text-white rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Get In Touch</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-green-400" />
                <span>contact@naelproductions.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-green-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-green-400" />
                <span>123 Publishing Ave, Creative District, NY 10001</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="text-green-400" />
                <span>www.naelproductions.com</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Send Us a Message</h3>
            <form className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Your Message" 
                  rows="4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="mt-16 text-center">
        <div className="inline-block p-6 bg-white rounded-xl shadow-lg">
          <div className="relative w-48 h-16 mx-auto">
            <Image 
              src={Image}
              alt="Nael Productions Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Nael Productions © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;