import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Terms of Use - Xtara",
  description: "Terms of Use for Xtara Career Guidance Platform. Learn about the terms and conditions for using our platform.",
};

const TermsOfUsePage: React.FC = () => {
  return (
    <Container>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-ocean-navy mb-8">Terms of Use for Xtara Career Guidance Platform</h1>
        
        <div className="prose prose-lg max-w-none">
          <div className="bg-cream-sand p-6 rounded-lg mb-8">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Last Updated:</strong> January 2025<br />
              <strong>Version:</strong> 1.0<br />
              <strong>Platform:</strong> Xtara<br />
              <strong>Developer:</strong> BigMints<br />
              <strong>Contact:</strong> legal@bigmints.com
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Xtara career guidance platform (&quot;Platform&quot;), you agree to be bound by these Terms of Use (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Platform.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and BigMints (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) regarding your use of the Xtara career guidance platform and related services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">2. Description of Service</h2>
            <p>Xtara is a comprehensive career guidance platform that provides:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Career Assessment Tools:</strong> Personality and interest-based career recommendations</li>
              <li><strong>Educational Guidance:</strong> Subject selection and curriculum recommendations</li>
              <li><strong>Performance Tracking:</strong> Academic performance monitoring and analysis</li>
              <li><strong>Career Path Exploration:</strong> Detailed information about various career opportunities</li>
              <li><strong>Location-Based Recommendations:</strong> Regional career and educational opportunities</li>
              <li><strong>AI-Powered Insights:</strong> Personalized career guidance using advanced algorithms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">3. User Eligibility</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">3.1 Age Requirements</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You must be at least 13 years old to use the Platform</li>
              <li>Users under 18 must have parental or guardian consent</li>
              <li>We do not knowingly collect personal information from children under 13</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">3.2 Account Requirements</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">3.3 Geographic Restrictions</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>The Platform is primarily designed for users in India</li>
              <li>Some features may not be available in all regions</li>
              <li>You must comply with local laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">4. User Accounts and Registration</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">4.1 Account Creation</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You must register with a valid email address</li>
              <li>You may be required to provide additional information for personalized services</li>
              <li>You can only create one account per email address</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">4.2 Account Security</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You are responsible for all activities under your account</li>
              <li>You must use strong passwords and keep them secure</li>
              <li>You must log out when using shared devices</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">4.3 Account Termination</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You may delete your account at any time through the Platform settings</li>
              <li>We may suspend or terminate accounts that violate these Terms</li>
              <li>Account deletion will remove your personal data as described in our Privacy Policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">5. Acceptable Use</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">5.1 Permitted Uses</h3>
            <p>You may use the Platform for:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Personal career guidance and educational planning</li>
              <li>Academic performance tracking and analysis</li>
              <li>Exploring career opportunities and educational paths</li>
              <li>Accessing career-related content and resources</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">5.2 Prohibited Uses</h3>
            <p>You may not:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
              <li>Interfere with or disrupt the Platform&apos;s functionality</li>
              <li>Upload, post, or transmit harmful, offensive, or inappropriate content</li>
              <li>Use automated tools to access or scrape the Platform</li>
              <li>Reverse engineer, decompile, or modify the Platform</li>
              <li>Use the Platform to harass, abuse, or harm others</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">6. User Content and Data</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">6.1 Your Content</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You retain ownership of content you submit to the Platform</li>
              <li>You grant us a license to use your content to provide our services</li>
              <li>You are responsible for the accuracy and legality of your content</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">6.2 Data Usage</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We collect and process your data as described in our Privacy Policy</li>
              <li>Your data is used to provide personalized career guidance</li>
              <li>We may use anonymized data for research and improvement purposes</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">6.3 Data Accuracy</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You are responsible for providing accurate information</li>
              <li>Career recommendations are based on the information you provide</li>
              <li>We are not responsible for decisions made based on our recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">7. Intellectual Property</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">7.1 Our Rights</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>The Platform and its content are owned by BigMints</li>
              <li>All trademarks, logos, and brand names are our property</li>
              <li>The Platform&apos;s design, code, and algorithms are protected by intellectual property laws</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">7.2 Your Rights</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You retain ownership of your personal content</li>
              <li>You may use the Platform&apos;s recommendations for personal purposes</li>
              <li>You may not reproduce, distribute, or commercialize our content</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">7.3 Third-Party Content</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>The Platform may contain content from third-party sources</li>
              <li>We are not responsible for third-party content accuracy</li>
              <li>Third-party content is subject to their respective terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">8. Privacy and Data Protection</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">8.1 Privacy Policy</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Your privacy is important to us</li>
              <li>Our Privacy Policy explains how we collect, use, and protect your data</li>
              <li>By using the Platform, you agree to our Privacy Policy</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">8.2 Data Security</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We implement industry-standard security measures</li>
              <li>We protect your personal information from unauthorized access</li>
              <li>We regularly update our security practices</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">8.3 Data Retention</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We retain your data as described in our Privacy Policy</li>
              <li>You may request deletion of your data at any time</li>
              <li>Some data may be retained for legal or business purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">9. Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">9.1 Service Availability</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We strive to provide reliable service but cannot guarantee uninterrupted access</li>
              <li>The Platform may be temporarily unavailable for maintenance or updates</li>
              <li>We are not responsible for service interruptions beyond our control</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">9.2 Career Guidance</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Our recommendations are for informational purposes only</li>
              <li>We do not guarantee career success or employment outcomes</li>
              <li>You should consult with career counselors for professional advice</li>
              <li>We are not responsible for decisions made based on our recommendations</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">9.3 Educational Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Educational information is provided for reference only</li>
              <li>We do not guarantee admission to educational institutions</li>
              <li>You should verify information with official sources</li>
              <li>We are not responsible for educational outcomes</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">9.4 Third-Party Services</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>The Platform may integrate with third-party services</li>
              <li>We are not responsible for third-party service availability or accuracy</li>
              <li>Third-party services are subject to their own terms and privacy policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">10. Limitation of Liability</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">10.1 General Limitation</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Our liability is limited to the amount you paid for the Platform (if any)</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>We are not liable for lost profits, data, or business opportunities</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">10.2 Specific Exclusions</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We are not liable for career or educational outcomes</li>
              <li>We are not liable for decisions made based on our recommendations</li>
              <li>We are not liable for third-party actions or content</li>
              <li>We are not liable for service interruptions or data loss</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">11. Indemnification</h2>
            <p>You agree to indemnify and hold harmless BigMints, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your violation of applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">12. Termination</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">12.1 Termination by You</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You may stop using the Platform at any time</li>
              <li>You may delete your account through the Platform settings</li>
              <li>Termination does not affect your obligations under these Terms</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">12.2 Termination by Us</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We may terminate or suspend your access for Terms violations</li>
              <li>We may terminate the Platform or your access with reasonable notice</li>
              <li>Termination does not affect your obligations under these Terms</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">12.3 Effect of Termination</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Your right to use the Platform ceases immediately</li>
              <li>We may delete your account and data</li>
              <li>Surviving provisions remain in effect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">13. Changes to Terms</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">13.1 Updates</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We may update these Terms from time to time</li>
              <li>We will notify you of significant changes</li>
              <li>Continued use constitutes acceptance of updated Terms</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">13.2 Notification</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We will notify you of changes through the Platform or email</li>
              <li>Changes become effective 30 days after notification</li>
              <li>You may reject changes by discontinuing use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">14. Governing Law and Disputes</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">14.1 Governing Law</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>These Terms are governed by the laws of [Your Jurisdiction]</li>
              <li>Any disputes will be resolved in the courts of [Your Jurisdiction]</li>
              <li>International users may be subject to different laws</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">14.2 Dispute Resolution</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We encourage resolving disputes through communication</li>
              <li>You may contact us at legal@bigmints.com</li>
              <li>Some disputes may require formal legal proceedings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">15. Severability</h2>
            <p>If any provision of these Terms is found to be unenforceable:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>The remaining provisions remain in full effect</li>
              <li>The unenforceable provision is modified to the minimum extent necessary</li>
              <li>The overall intent of the Terms is preserved</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">16. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and BigMints regarding the Platform. They supersede all prior agreements and understandings.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">17. Contact Information</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <div className="bg-cream-sand p-6 rounded-lg mt-4">
              <p><strong>Email:</strong> legal@bigmints.com</p>
              <p><strong>Address:</strong> BigMints, [Your Business Address]</p>
              <p><strong>Phone:</strong> [Your Contact Number]</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">18. Additional Terms for Specific Features</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">18.1 AI-Powered Recommendations</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Our AI recommendations are based on available data</li>
              <li>Recommendations may not be 100% accurate</li>
              <li>We continuously improve our algorithms</li>
              <li>You should use recommendations as guidance, not absolute truth</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">18.2 Location-Based Services</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Location services require your consent</li>
              <li>We use location data for regional recommendations</li>
              <li>You can disable location services in your browser settings</li>
              <li>Location data is processed as described in our Privacy Policy</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">18.3 Assessment Tools</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Assessment results are for educational purposes</li>
              <li>Results may vary based on your honest responses</li>
              <li>We do not guarantee assessment accuracy</li>
              <li>You should consult professionals for formal assessments</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">19. Updates and Maintenance</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">19.1 Platform Updates</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We regularly update the Platform to improve functionality</li>
              <li>Updates may change features or functionality</li>
              <li>We will notify you of significant changes</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">19.2 Maintenance</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We may perform maintenance that temporarily affects service</li>
              <li>We will provide advance notice when possible</li>
              <li>Maintenance is necessary for Platform security and performance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ocean-navy mb-4">20. Support and Feedback</h2>
            
            <h3 className="text-xl font-medium text-ocean-navy mb-3">20.1 Support</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We provide support through the Platform and email</li>
              <li>Support is available during business hours</li>
              <li>We strive to respond to inquiries promptly</li>
              <li>Support does not include professional career counseling</li>
            </ul>

            <h3 className="text-xl font-medium text-ocean-navy mb-3">20.2 Feedback</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>We welcome your feedback and suggestions</li>
              <li>Feedback helps us improve the Platform</li>
              <li>You grant us rights to use your feedback</li>
              <li>We are not obligated to implement all suggestions</li>
            </ul>
          </section>

          <div className="bg-cream-sand p-6 rounded-lg mt-8">
            <p className="text-center font-medium">
              <strong>By using Xtara, you acknowledge that you have read, understood, and agree to these Terms of Use.</strong>
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              <em>These Terms of Use are effective as of January 2025 and will remain in effect except with respect to any changes in their provisions in the future.</em>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TermsOfUsePage; 