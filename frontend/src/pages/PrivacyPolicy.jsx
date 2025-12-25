import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/register" 
          className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Register
        </Link>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold">Privacy Policy</h1>
          </div>

          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Last updated: December 25, 2024
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">1. Introduction</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Study Match Maker ("Study Match," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our study partner matching platform ("Platform"). By using Study Match, you consent to the data practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2 text-slate-700 dark:text-slate-300">2.1 Information You Provide</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                When you create an account and use Study Match, you voluntarily provide:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, and password</li>
                <li><strong>Profile Information:</strong> Bio, profile picture (optional), subjects of study, learning style preferences, exam preparation goals</li>
                <li><strong>Availability Data:</strong> Your study schedule and preferred study times</li>
                <li><strong>Communications:</strong> Messages sent to other users through our chat feature</li>
                <li><strong>Study Activity:</strong> Study session logs, duration, and notes you choose to record</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4 text-slate-700 dark:text-slate-300">2.2 Information Collected Automatically</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                When you use the Platform, we may automatically collect:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access times, pages viewed, and actions taken on the Platform</li>
                <li><strong>Usage Data:</strong> Features used, match interactions, and session participation</li>
                <li><strong>Cookies:</strong> Session tokens and authentication data (see Section 8)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">3. How We Use Your Information</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Provide Services:</strong> Create and manage your account, facilitate study partner matching, and enable messaging</li>
                <li><strong>Matching Algorithm:</strong> Analyze your profile, subjects, availability, and learning style to suggest compatible study partners</li>
                <li><strong>AI-Enhanced Matching:</strong> Process your profile data through third-party AI services (when enabled) to provide personalized match recommendations and explanations</li>
                <li><strong>Communication:</strong> Send notifications about matches, messages, scheduled sessions, and important updates</li>
                <li><strong>Study Tracking:</strong> Display your study activity, streaks, and progress statistics</li>
                <li><strong>Platform Improvement:</strong> Analyze usage patterns to improve our matching algorithms and user experience</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and unauthorized access</li>
                <li><strong>Legal Compliance:</strong> Comply with applicable laws, regulations, and legal processes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-lg font-medium mb-2 mt-4 text-slate-700 dark:text-slate-300">4.1 With Other Users</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To facilitate study matching, certain profile information is visible to other users:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>Your name and profile picture (if provided)</li>
                <li>Subjects you're studying and learning style</li>
                <li>General availability and exam preparation goals</li>
                <li>Bio and any information you choose to include in your public profile</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                Your email address is not shared with other users unless you choose to share it directly through chat.
              </p>

              <h3 className="text-lg font-medium mb-2 mt-4 text-slate-700 dark:text-slate-300">4.2 Third-Party Service Providers</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We may share data with trusted third-party services that help us operate the Platform:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>AI Services:</strong> Profile data may be processed by AI providers (such as Groq) to generate match suggestions and recommendations. This data is used only for matching purposes and is not stored by these providers beyond what's necessary for processing.</li>
                <li><strong>Hosting Services:</strong> Our Platform is hosted on cloud infrastructure that stores your data securely</li>
                <li><strong>Database Services:</strong> User data is stored in secure databases</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4 text-slate-700 dark:text-slate-300">4.3 Legal Requirements</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We may disclose your information if required to do so by law, court order, or government request, or if we believe disclosure is necessary to protect the rights, property, or safety of Study Match, our users, or the public.
              </p>

              <h3 className="text-lg font-medium mb-2 mt-4 text-slate-700 dark:text-slate-300">4.4 Business Transfers</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, user information may be transferred to the acquiring entity. We will provide notice before your information becomes subject to a different privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">5. Data Security</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Encryption:</strong> Data transmitted between your browser and our servers is encrypted using HTTPS/TLS</li>
                <li><strong>Password Security:</strong> Passwords are hashed using industry-standard algorithms and never stored in plain text</li>
                <li><strong>Authentication:</strong> Secure JWT-based authentication with token expiration</li>
                <li><strong>Access Controls:</strong> Restricted access to user data on a need-to-know basis</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                While we strive to protect your information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">6. Your Rights and Choices</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Access:</strong> You can view your personal data through your profile and settings pages</li>
                <li><strong>Correction:</strong> You can update or correct your profile information at any time through your account settings</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and associated data through your account settings</li>
                <li><strong>Notification Preferences:</strong> You can manage notification settings to control what communications you receive</li>
                <li><strong>Profile Visibility:</strong> You can control what information is visible on your public profile through privacy settings</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                To exercise these rights, access your account settings or contact us through the Platform's support channels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">7. Data Retention</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you with our services. When you delete your account:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>Your profile and personal data will be marked for deletion</li>
                <li>Your data will be permanently deleted within 30 days</li>
                <li>Some anonymized or aggregated data may be retained for analytical purposes</li>
                <li>Data required for legal compliance may be retained for the legally required period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">8. Cookies and Local Storage</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Study Match uses cookies and local storage to:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Authentication:</strong> Keep you logged in securely across sessions</li>
                <li><strong>Preferences:</strong> Remember your settings (such as dark mode preference)</li>
                <li><strong>Security:</strong> Help detect and prevent unauthorized access</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                We use essential cookies only. These are necessary for the Platform to function and cannot be disabled. We do not use third-party advertising or tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">9. Children's Privacy</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Study Match is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us. If we discover that we have collected information from a child under 13, we will promptly delete that information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">10. International Data Transfers</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using Study Match, you consent to the transfer of your information to such countries. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">11. Third-Party Links</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">12. Changes to This Privacy Policy</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We may update this Privacy Policy from time to time. When we make material changes, we will notify you by updating the "Last updated" date at the top of this policy and, where appropriate, provide additional notice (such as through the Platform or via email). We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">13. Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the Platform's support channels or settings page.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              By using Study Match, you acknowledge that you have read and understood this Privacy Policy. See also our{' '}
              <Link to="/terms" className="text-primary-500 hover:text-primary-600">
                Terms of Service
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

