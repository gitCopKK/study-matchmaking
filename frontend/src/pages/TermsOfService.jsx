import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfService() {
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold">Terms of Service</h1>
          </div>

          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Last updated: December 25, 2024
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">1. Acceptance of Terms</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                By accessing or using Study Match Maker ("Study Match," "the Platform," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you must not access or use the Platform. These Terms constitute a legally binding agreement between you and Study Match.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">2. Description of Service</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Study Match Maker is a platform designed to connect students and learners for collaborative study sessions. Our services include:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>Study partner matching based on subjects, availability, learning styles, and compatibility</li>
                <li>AI-enhanced matching using third-party services to provide personalized recommendations</li>
                <li>Real-time messaging and communication with matched study partners</li>
                <li>Study session scheduling and calendar management</li>
                <li>Study activity tracking, streak maintenance, and progress visualization</li>
                <li>Notifications for matches, messages, and session reminders</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">3. Eligibility and User Accounts</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To use Study Match, you must:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>Be at least 13 years of age (users under 18 should have parental or guardian consent)</li>
                <li>Provide accurate, current, and complete registration information</li>
                <li>Maintain the security and confidentiality of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">4. Acceptable Use Policy</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You agree to use Study Match responsibly and lawfully. You must not:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>Harass, bully, threaten, or intimidate other users</li>
                <li>Post or transmit content that is offensive, defamatory, obscene, or harmful</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                <li>Use the Platform for any illegal purpose or in violation of any applicable laws</li>
                <li>Attempt to gain unauthorized access to our systems, servers, or other users' accounts</li>
                <li>Send spam, unsolicited messages, or engage in any form of automated messaging</li>
                <li>Interfere with or disrupt the integrity or performance of the Platform</li>
                <li>Collect or harvest user information without consent</li>
                <li>Use the Platform to promote academic dishonesty or cheating</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">5. AI-Powered Features</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Study Match may use artificial intelligence and machine learning technologies (provided by third-party services) to enhance study partner matching. By using the Platform, you acknowledge that:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>AI-generated match suggestions are based on profile information you provide</li>
                <li>AI recommendations are meant to assist, not guarantee, finding compatible study partners</li>
                <li>Your profile data may be processed by third-party AI services to generate matches</li>
                <li>The Platform may fall back to non-AI matching algorithms when AI services are unavailable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">6. User Content</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You retain ownership of any content you create, upload, or share on Study Match ("User Content"). By posting User Content, you grant Study Match a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your User Content solely for the purpose of operating and providing the Platform services.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                You represent and warrant that you own or have the necessary rights to post your User Content and that it does not infringe upon the rights of any third party.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">7. Study Sessions and User Interactions</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                When using Study Match to connect with study partners, you agree to:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>Treat all users with respect and maintain professional conduct</li>
                <li>Communicate clearly and promptly about scheduling changes</li>
                <li>Uphold academic integrity in all collaborative activities</li>
                <li>Report any inappropriate behavior or safety concerns to our support team</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                Study Match is not responsible for the conduct of users during study sessions. Users interact at their own discretion and risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">8. Privacy</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Your use of Study Match is also governed by our{' '}
                <Link to="/privacy" className="text-primary-500 hover:text-primary-600">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your personal information. By using the Platform, you consent to our data practices as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">9. Intellectual Property</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The Study Match platform, including its design, features, code, graphics, and content (excluding User Content), is owned by Study Match and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our Platform without express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">10. Account Termination</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time if we reasonably believe you have violated these Terms. You may also delete your account at any time through your account settings. Upon termination:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>Your right to access and use the Platform will immediately cease</li>
                <li>We may delete your User Content and account data in accordance with our Privacy Policy</li>
                <li>Provisions of these Terms that should survive termination will remain in effect</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">11. Disclaimers</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, STUDY MATCH DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400 space-y-1">
                <li>The Platform will be uninterrupted, secure, or error-free</li>
                <li>Match suggestions will result in successful study partnerships</li>
                <li>Information provided by other users is accurate or reliable</li>
                <li>Your use of the Platform will improve academic performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">12. Limitation of Liability</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STUDY MATCH AND ITS OPERATORS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">13. Indemnification</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Study Match and its operators from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of your use of the Platform, your User Content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">14. Modifications to Terms</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We may revise these Terms at any time by updating this page. We will notify users of material changes via email or through a notice on the Platform. Your continued use of Study Match after such modifications constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">15. Governing Law</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Platform shall be resolved through appropriate legal channels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">16. Severability</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">17. Entire Agreement</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Study Match regarding your use of the Platform and supersede any prior agreements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">18. Contact Information</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                If you have any questions, concerns, or feedback regarding these Terms of Service, please contact us through the Platform's support channels or at the contact information provided in your account settings.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
