
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import RegistrationForm from '@/components/RegistrationForm';
import Dashboard from '@/components/Dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegistrationFormData } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { Lock, Building, Users, Shield, ChevronRight } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleRegisterClick = () => {
    setShowRegistrationForm(true);
  };
  
  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
    toast({
      title: 'Registration Received',
      description: 'Your application will be reviewed manually by our team.',
    });
    setShowRegistrationForm(false);
  };
  
  // Mock login for demo purposes
  const handleLoginClick = () => {
    setIsLoggedIn(true);
    toast({
      title: 'Login Successful',
      description: 'Welcome back to Real Estate Private Club.',
    });
  };
  
  if (isLoggedIn) {
    return <Dashboard />;
  }
  
  return (
    <div className="min-h-screen bg-estate-offwhite">
      {/* Hero Section */}
      <header className="bg-estate-navy text-white">
        <div className="estate-container py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Real Estate Private Club</h1>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-estate-navy" onClick={handleLoginClick}>
              Member Access
            </Button>
          </div>
        </div>
        
        <div className="estate-container py-20 md:py-32">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Exclusive Real Estate Opportunities for Qualified Investors</h2>
            <p className="text-lg mb-8 text-estate-lightgrey">
              A private, secure platform connecting trusted mandataries and sophisticated investors for high-value real estate transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-estate-navy hover:bg-estate-lightgrey"
                onClick={handleRegisterClick}
              >
                Apply for Membership
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="estate-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-estate-slate">Why Choose Our Platform</h2>
            <p className="text-estate-steel max-w-2xl mx-auto">
              We provide a secure, private environment for real estate professionals and investors to connect without compromising confidentiality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-estate-navy" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Absolute Privacy</h3>
              <p className="text-estate-steel">
                All user identities are anonymized and protected through a secure ID system.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-estate-navy" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Premium Assets</h3>
              <p className="text-estate-steel">
                Access to exclusive off-market properties and investment opportunities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-estate-navy" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Vetted Network</h3>
              <p className="text-estate-steel">
                Every member is manually verified and approved by our team.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-estate-navy" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Secure Process</h3>
              <p className="text-estate-steel">
                Strict NDA requirements and controlled information sharing.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="estate-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-estate-slate">How It Works</h2>
            <p className="text-estate-steel max-w-2xl mx-auto">
              Our platform is designed with security and discretion at its core, ensuring a controlled process from registration to transaction.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-estate-lightgrey"></div>
              
              {/* Steps */}
              <div className="space-y-12">
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Application & Verification</h3>
                  <p className="text-estate-steel">
                    Submit your membership application. Our team manually reviews and verifies your credentials.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Access Granted</h3>
                  <p className="text-estate-steel">
                    Upon approval, you receive a secure anonymous ID and access to the platform.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Discover Opportunities</h3>
                  <p className="text-estate-steel">
                    Browse anonymized listings of exclusive assets or submit your own opportunities.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">4</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Request Information</h3>
                  <p className="text-estate-steel">
                    Request detailed information on assets of interest. Sign a specific NDA for each asset.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">5</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Secure Transactions</h3>
                  <p className="text-estate-steel">
                    Connect with counterparties through our secure platform with full confidentiality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-estate-navy text-white">
        <div className="estate-container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-lg text-estate-lightgrey mb-8 max-w-2xl mx-auto">
            Apply for membership to access exclusive real estate opportunities in our private network.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-estate-navy hover:bg-estate-lightgrey"
            onClick={handleRegisterClick}
          >
            Apply for Membership
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-estate-slate text-white py-10">
        <div className="estate-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">Real Estate Private Club</h2>
              <p className="text-estate-lightgrey text-sm mt-1">Exclusive. Secure. Confidential.</p>
            </div>
            <div className="text-sm text-estate-lightgrey">
              &copy; {new Date().getFullYear()} Real Estate Private Club. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Registration Modal */}
      <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Membership Application</DialogTitle>
          </DialogHeader>
          <RegistrationForm onSubmit={handleRegistrationSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
