import { useState } from 'react';
import { servicesData } from '../../../mocks/servicesData';

interface ServiceInquiryFormProps {
  serviceName: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ServiceInquiryForm({ serviceName }: ServiceInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const serviceOptions = Array.from(new Set(servicesData.map((service) => service.title)));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const inquiryData = {
      service_name: (formData.get('service_name') as string) || serviceName,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
      budget_range: formData.get('budget_range') as string,
      timeline: formData.get('timeline') as string,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/enquiries/service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Service inquiry submission failed:', errorData?.message || response.statusText);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
              placeholder="+234 803 456 7890"
            />
          </div>

          <div>
            <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">
              Service *
            </label>
            <select
              id="service_name"
              name="service_name"
              defaultValue={serviceName}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
            >
              {!serviceOptions.includes(serviceName) && <option value={serviceName}>{serviceName}</option>}
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range *
            </label>
            <select
              id="budget_range"
              name="budget_range"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
            >
              <option value="">Select budget range</option>
              <option value="Under 5000">Under 5000</option>
              <option value="5000 - 10000">5000 - 10000</option>
              <option value="10000 - 50000">10000 - 50000</option>
              <option value="Over 50000">Over 50000</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Timeline *
            </label>
            <select
              id="timeline"
              name="timeline"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
            >
              <option value="">Select timeline</option>
              <option value="Urgent within one week">Urgent within one week</option>
              <option value="1 - 2 weeks">1 - 2 weeks</option>
              <option value="2 - 4 weeks">2 - 4 weeks</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
            placeholder="Please provide details about your requirements..."
          />
          <p className="text-sm text-gray-500 mt-1">Maximum 500 characters</p>
        </div>

        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <i className="ri-checkbox-circle-fill text-green-600 text-xl"></i>
            <div>
              <h4 className="font-semibold text-green-900">Inquiry Submitted Successfully!</h4>
              <p className="text-sm text-green-700 mt-1">
                Thank you for your interest. Our team will contact you within 24 hours.
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <i className="ri-error-warning-fill text-red-600 text-xl"></i>
            <div>
              <h4 className="font-semibold text-red-900">Submission Failed</h4>
              <p className="text-sm text-red-700 mt-1">
                Something went wrong. Please try again or contact us directly.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Submitting...
            </>
          ) : (
            <>
              <i className="ri-send-plane-fill mr-2"></i>
              Submit Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}
