import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Shield, Users, BarChart3, FileText, Upload, ArrowRight, CheckCircle2, Sparkles, TrendingUp, Award, Zap, Lock, Cloud, BookOpen, Target, Rocket } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">EduTrack</span>
                    </div>
                    <Link to="/login">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700">Modern Education Management</span>
                            </div>
                            
                            <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                                Manage Your
                                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Institution Smarter
                                </span>
                            </h1>
                            
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Complete student management system with role-based access, real-time analytics, and automated reporting. Built for modern educational institutions.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <Link to="/login">
                                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all">
                                        Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-gray-300 hover:border-blue-600" asChild>
                                    <a href="#features">View Features</a>
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-8 pt-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">No Credit Card</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Free Setup</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">24/7 Support</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                        <div className="bg-blue-600 p-3 rounded-lg">
                                            <Shield className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Secure Access</div>
                                            <div className="text-sm text-gray-600">Role-based permissions</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                                        <div className="bg-indigo-600 p-3 rounded-lg">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Multi-College</div>
                                            <div className="text-sm text-gray-600">Unlimited institutions</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                        <div className="bg-purple-600 p-3 rounded-lg">
                                            <BarChart3 className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Live Analytics</div>
                                            <div className="text-sm text-gray-600">Real-time insights</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-200">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">50K+</div>
                            <div className="text-gray-600 font-medium">Active Students</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">100+</div>
                            <div className="text-gray-600 font-medium">Institutions</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">99.9%</div>
                            <div className="text-gray-600 font-medium">Uptime</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">24/7</div>
                            <div className="text-gray-600 font-medium">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to manage your educational institution efficiently</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: 'Role-Based Access', desc: 'Secure authentication with 4 distinct user roles', color: 'blue' },
                            { icon: Users, title: 'Multi-College Support', desc: 'Manage unlimited colleges from one platform', color: 'indigo' },
                            { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Live dashboards with actionable insights', color: 'purple' },
                            { icon: FileText, title: 'Smart Reports', desc: 'Generate PDF/Excel reports instantly', color: 'pink' },
                            { icon: Upload, title: 'Bulk Operations', desc: 'Upload thousands of records at once', color: 'red' },
                            { icon: Lock, title: 'Data Security', desc: 'Enterprise-grade encryption & backups', color: 'orange' },
                            { icon: Cloud, title: 'Cloud-Based', desc: 'Access from anywhere, anytime', color: 'cyan' },
                            { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed and performance', color: 'yellow' },
                            { icon: BookOpen, title: 'Student Portal', desc: 'Complete academic lifecycle management', color: 'green' },
                        ].map((feature, i) => (
                            <Card key={i} className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200 group hover:-translate-y-2">
                                <CardContent className="pt-8 pb-6">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-50 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-16 text-center text-white shadow-2xl">
                        <Rocket className="h-16 w-16 mx-auto mb-6" />
                        <h2 className="text-5xl font-bold mb-6">Ready to Get Started?</h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Join hundreds of institutions using EduTrack for seamless academic management
                        </p>
                        <Link to="/login">
                            <Button size="lg" variant="secondary" className="text-lg px-10 py-7 shadow-xl hover:scale-105 transition-transform">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold">EduTrack</span>
                    </div>
                    <p className="text-gray-400 mb-2">&copy; 2024 EduTrack. All rights reserved.</p>
                    <p className="text-sm text-gray-500">Empowering Education Through Technology</p>
                </div>
            </footer>
        </div>
    );
}