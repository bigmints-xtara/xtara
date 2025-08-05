import type { Metadata } from "next";
import Container from "@/components/Container";
import { privacyPolicyData } from "@/data/privacyPolicyData";

export const metadata: Metadata = {
  title: privacyPolicyData.metadata.title,
  description: privacyPolicyData.metadata.description,
  keywords: privacyPolicyData.metadata.keywords,
  openGraph: {
    title: privacyPolicyData.metadata.title,
    description: privacyPolicyData.metadata.description,
    images: [privacyPolicyData.metadata.ogImage],
    url: privacyPolicyData.metadata.canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: privacyPolicyData.metadata.title,
    description: privacyPolicyData.metadata.description,
    images: [privacyPolicyData.metadata.ogImage],
  },
  alternates: {
    canonical: privacyPolicyData.metadata.canonicalUrl,
  },
};

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Container>
      <div className="py-4 px-6 md:py-6 md:px-8">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-ocean-navy mb-8">Privacy Policy for Xtara Career Guidance Platform</h1>
        
        <div className="prose prose-lg max-w-none">
          <div className="bg-cream-sand p-6 rounded-lg mb-8">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Last Updated:</strong> January 2025<br />
              <strong>Version:</strong> 1.0<br />
              <strong>Platform:</strong> Xtara<br />
              <strong>Developer:</strong> BigMints<br />
              <strong>Contact:</strong> privacy@bigmints.com
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">1. Introduction</h2>
            <p>
              Welcome to Xtara, a comprehensive career guidance platform designed to help students and professionals make informed career decisions. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform and related services.
            </p>
            <p>
              By using Xtara, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">2.1 Personal Information</h3>
            <p>We collect the following personal information to provide you with personalized career guidance:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Information:</strong> Email address, full name, phone number</li>
              <li><strong>Demographic Information:</strong> Gender, date of birth, location (state, district, city)</li>
              <li><strong>Educational Information:</strong> Current grade, education board, stream (Science/Commerce/Humanities/Arts)</li>
              <li><strong>Academic Performance:</strong> Subject-wise marks and exam performance data</li>
              <li><strong>Career Preferences:</strong> Interests, career goals, personality traits</li>
              <li><strong>Family Information:</strong> Parental influence, family income, siblings information</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">2.2 Assessment Data</h3>
            <p>When you complete our career assessment, we collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Personality Assessment:</strong> Responses to personality trait questions</li>
              <li><strong>Interest Assessment:</strong> Your interests and preferences</li>
              <li><strong>Academic Strengths/Weaknesses:</strong> Self-reported academic performance</li>
              <li><strong>Career Aspirations:</strong> Your career goals and aspirations</li>
              <li><strong>Financial Background:</strong> Family income information for scholarship recommendations</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">2.3 Usage Data</h3>
            <p>We automatically collect certain information about your platform usage:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Device Information:</strong> Device type, operating system, browser version</li>
              <li><strong>Usage Analytics:</strong> Page views, feature usage, time spent on different sections</li>
              <li><strong>Performance Data:</strong> Platform crashes, error logs, performance metrics</li>
              <li><strong>Navigation Data:</strong> Pages visited, user journey patterns</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">2.4 Location Data</h3>
            <p>We collect location information to provide region-specific career guidance:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>State/Union Territory:</strong> For board-specific curriculum recommendations</li>
              <li><strong>District:</strong> For local institution and opportunity recommendations</li>
              <li><strong>City:</strong> For nearby career opportunities and events</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">3. How We Use Your Information</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">3.1 Primary Uses</h3>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Provide Personalized Career Guidance:</strong> Generate career recommendations based on your profile</li>
              <li><strong>Deliver Assessment Results:</strong> Provide detailed career path analysis and recommendations</li>
              <li><strong>Recommend Courses and Institutions:</strong> Suggest relevant educational opportunities</li>
              <li><strong>Personalize Content:</strong> Show relevant articles, stories, and resources</li>
              <li><strong>Improve User Experience:</strong> Enhance platform functionality and user interface</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">3.2 Analytics and Improvement</h3>
            <p>We use aggregated data to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Analyze Usage Patterns:</strong> Understand how users interact with the platform</li>
              <li><strong>Improve Features:</strong> Enhance existing features and develop new ones</li>
              <li><strong>Optimize Performance:</strong> Identify and fix technical issues</li>
              <li><strong>Conduct Research:</strong> Improve career guidance algorithms and recommendations</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">3.3 Communication</h3>
            <p>We may use your contact information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Send Notifications:</strong> Important updates about your career recommendations</li>
              <li><strong>Provide Support:</strong> Respond to your questions and provide assistance</li>
              <li><strong>Send Updates:</strong> Inform you about new features and improvements</li>
              <li><strong>Share Resources:</strong> Send relevant career articles and opportunities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">4. Data Storage and Security</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">4.1 Data Storage</h3>
            <p>Your data is stored securely using:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Firebase Firestore:</strong> Cloud database for user profiles and assessment data</li>
              <li><strong>Google Cloud Platform:</strong> Secure cloud infrastructure</li>
              <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
              <li><strong>Access Controls:</strong> Strict access controls and authentication</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">4.2 Data Retention</h3>
            <p>We retain your data for:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Active Users:</strong> As long as your account is active</li>
              <li><strong>Inactive Accounts:</strong> Up to 2 years after last activity</li>
              <li><strong>Assessment Data:</strong> Indefinitely for improving our algorithms (anonymized)</li>
              <li><strong>Analytics Data:</strong> Up to 3 years for research and improvement purposes</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">4.3 Data Security</h3>
            <p>We implement comprehensive security measures:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Encryption:</strong> AES-256 encryption for all sensitive data</li>
              <li><strong>Authentication:</strong> Multi-factor authentication for admin access</li>
              <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
              <li><strong>Employee Training:</strong> Regular security training for all team members</li>
              <li><strong>Incident Response:</strong> Procedures for handling security incidents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">5. Data Sharing and Third-Party Services</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">5.1 Third-Party Services</h3>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Firebase (Google):</strong> Authentication, database, analytics, and hosting</li>
              <li><strong>Google Cloud Platform:</strong> Cloud infrastructure and AI services</li>
              <li><strong>Vertex AI (Google):</strong> AI-powered career recommendations</li>
              <li><strong>Firebase Analytics:</strong> Usage analytics and performance monitoring</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">5.2 Data Sharing</h3>
            <p>We do not sell, trade, or rent your personal information. We may share data only in the following circumstances:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate the platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>User Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">6. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">6.1 Access and Control</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Access Your Data:</strong> Request a copy of all personal information we hold</li>
              <li><strong>Update Information:</strong> Correct or update your personal information</li>
              <li><strong>Delete Account:</strong> Request deletion of your account and associated data</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Opt out of certain data collection and communications</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">6.2 Privacy Settings</h3>
            <p>You can control your privacy through:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Profile Settings:</strong> Update or delete personal information</li>
              <li><strong>Notification Preferences:</strong> Control push notifications and emails</li>
              <li><strong>Data Sharing:</strong> Choose what information to share</li>
              <li><strong>Assessment Privacy:</strong> Control visibility of assessment results</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">6.3 Children&apos;s Privacy</h3>
            <p>Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">7. Cookies and Tracking Technologies</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">7.1 Platform Analytics</h3>
            <p>We use analytics tools to understand platform usage:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Firebase Analytics:</strong> Track platform performance and user behavior</li>
              <li><strong>Crash Reporting:</strong> Monitor and fix platform crashes</li>
              <li><strong>Performance Monitoring:</strong> Track platform speed and reliability</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">7.2 Opt-Out Options</h3>
            <p>You can opt out of analytics tracking through:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Platform Settings:</strong> Disable analytics in platform preferences</li>
              <li><strong>Browser Settings:</strong> Adjust privacy settings in your browser</li>
              <li><strong>Contact Us:</strong> Request complete opt-out of tracking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">8. Data Breach Notification</h2>
            <p>In the event of a data breach that affects your personal information, we will:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Notify You Promptly:</strong> Within 72 hours of discovering the breach</li>
              <li><strong>Provide Details:</strong> Explain what information was affected</li>
              <li><strong>Take Action:</strong> Implement measures to prevent further breaches</li>
              <li><strong>Cooperate with Authorities:</strong> Work with relevant authorities as required</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">9. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Notify Users:</strong> Inform you of significant changes</li>
              <li><strong>Update Date:</strong> Clearly indicate when the policy was last updated</li>
              <li><strong>Provide Options:</strong> Give you the choice to accept or decline changes</li>
              <li><strong>Maintain Transparency:</strong> Explain what changes were made and why</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">10. Your Rights - Account Deletion</h2>
            <p>You have the right to request the deletion of your account and all associated personal data. We will:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Process Your Request:</strong> Within 30 days of receiving your deletion request</li>
              <li><strong>Delete All Data:</strong> Remove your personal information from our systems</li>
              <li><strong>Confirm Deletion:</strong> Send you a confirmation email once the deletion is complete</li>
              <li><strong>Retain Legal Records:</strong> Keep only information required by law or for legitimate business purposes</li>
            </ul>
            
            <div className="bg-sky-blue bg-opacity-10 border border-sky-blue rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-ocean-navy mb-3">Request Account Deletion</h3>
              <p className="text-gray-700 mb-4">
                To request the deletion of your account and personal data, please use our dedicated account deletion form.
              </p>
              <a 
                href="/privacy-policy/delete-account" 
                className="inline-block bg-ocean-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Request Account Deletion
              </a>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">11. Contact Information</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
            <div className="bg-cream-sand p-6 rounded-lg mt-4">
              <p><strong>Email:</strong> privacy@bigmints.com</p>
              <p><strong>Address:</strong> BigMints, [Your Business Address]</p>
              <p><strong>Phone:</strong> [Your Contact Number]</p>
            </div>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3 mt-6">11.1 Data Protection Officer</h3>
            <p>For EU users, you can also contact our Data Protection Officer:</p>
            <p><strong>Email:</strong> dpo@bigmints.com</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">12. Legal Basis for Processing (EU Users)</h2>
            <p>For users in the European Union, we process your data based on:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Consent:</strong> For marketing communications and optional features</li>
              <li><strong>Contract Performance:</strong> To provide career guidance services</li>
              <li><strong>Legitimate Interest:</strong> For platform improvement and security</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">13. California Privacy Rights (CCPA)</h2>
            <p>California residents have additional rights under the California Consumer Privacy Act:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Right to Know:</strong> Request information about data collection and sharing</li>
              <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt out of data sales (we do not sell data)</li>
              <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">14. India Privacy Rights (DPDPA)</h2>
            <p>For users in India, you have rights under the Digital Personal Data Protection Act:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Right to Information:</strong> Know what personal data is being processed</li>
              <li><strong>Right to Correction:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of personal data</li>
              <li><strong>Right to Grievance Redressal:</strong> File complaints about data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">15. Governing Law</h2>
            <p>This Privacy Policy is governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].</p>
          </section>

          <div className="bg-cream-sand p-6 rounded-lg mt-8">
            <p className="text-center font-medium">
              <strong>By using Xtara, you acknowledge that you have read, understood, and agree to this Privacy Policy.</strong>
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              <em>This Privacy Policy is effective as of January 2025 and will remain in effect except with respect to any changes in its provisions in the future.</em>
            </p>
          </div>
        </div>
        </div>
      </div>
    </Container>
  );
};

export default PrivacyPolicyPage; 