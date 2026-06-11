import React from 'react'
import { assets } from '../assets/assets'
import { Briefcase, Mail, MapPin } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold text-white">Insider<span className="text-blue-400">jobs</span></span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-5">
                            Connecting university students with real-world freelance opportunities and trusted project owners.
                            Build experience, portfolio strength, and income in one platform.
                        </p>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="w-4 h-4 text-blue-400" />
                                support@insiderjobs.com
                            </p>
                            <p className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                Colombo, Sri Lanka
                            </p>
                        </div>
                    </div>
                    {[
                        { heading: 'For Students', links: ['Browse Projects', 'How It Works', 'Saved Jobs', 'Skill Assessments', 'Portfolio Tips'] },
                        { heading: 'For Owners', links: ['Post a Project', 'Find Talent', 'Pricing Plans', 'Enterprise Hiring', 'Managed Projects'] },
                        { heading: 'Resources', links: ['Help Center', 'Blog', 'Community', 'Career Guides', 'API Status'] },
                        { heading: 'Company', links: ['About Us', 'Contact', 'Partnerships', 'Trust & Safety', 'Press Kit'] },
                    ].map(col => (
                        <div key={col.heading}>
                            <p className="text-sm font-semibold text-slate-200 mb-4">{col.heading}</p>
                            <ul className="space-y-2.5">
                                {col.links.map(l => (
                                    <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-slate-800 pt-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                    <div>

                        <div className="flex flex-wrap items-center gap-4">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility', 'Sitemap'].map(l => (
                                <a key={l} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{l}</a>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {['Twitter', 'LinkedIn', 'Instagram', 'YouTube', 'Facebook'].map(s => (
                            <a key={s} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{s}</a>
                        ))}
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-center text-xs text-slate-500 mt-6">&copy; {new Date().getFullYear()} InsiderJobs. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer