"use client"
import { useState } from "react";
import { contactData } from "@/data/contactData";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // For now, we'll use a simple mailto link since we don't have a backend
      // In a real implementation, you'd send this to your backend API
      const mailtoLink = `mailto:${contactData.content['Contact Form Section']['Contact Email']}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;
      
      window.location.href = mailtoLink;
      setSubmitStatus("success");
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {contactData.content['Contact Form Section']['Heading']}
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          {contactData.content['Contact Form Section']['Subheading']}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Name *
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-ocean-navy sm:text-sm sm:leading-6"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email *
            </label>
            <div className="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-ocean-navy sm:text-sm sm:leading-6"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">
            Subject *
          </label>
          <div className="mt-2">
            <select
              name="subject"
              id="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-ocean-navy sm:text-sm sm:leading-6"
            >
              <option value="">Select a subject</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Partnership">Partnership</option>
              <option value="Feedback">Feedback</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium leading-6 text-gray-900">
            Message *
          </label>
          <div className="mt-2">
            <textarea
              name="message"
              id="message"
              rows={6}
              required
              value={formData.message}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-ocean-navy sm:text-sm sm:leading-6"
              placeholder="Tell us how we can help you..."
            />
          </div>
        </div>

        {submitStatus === "success" && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Message sent successfully! We&apos;ll get back to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  There was an error sending your message. Please try again.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-ocean-navy px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-ocean-navy/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-navy disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📧 Email: <a href={`mailto:${contactData.content['Contact Form Section']['Contact Email']}`} className="text-ocean-navy hover:underline">{contactData.content['Contact Form Section']['Contact Email']}</a></p>
            <p>⏰ Response Time: {contactData.content['Contact Form Section']['Response Time']}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm; 