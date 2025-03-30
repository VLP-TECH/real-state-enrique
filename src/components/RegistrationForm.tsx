
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RegistrationFormData, UserRole } from '@/utils/types';
import { Check } from 'lucide-react';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: 'buyer_mandatary',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as UserRole,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.company || !formData.role) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };
  
  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'seller_mandatary':
        return 'Seller Mandatary';
      case 'buyer_mandatary':
        return 'Buyer Mandatary';
      case 'investor':
        return 'Investor / Family Office';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };
  
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-estate-success/20 flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-estate-success" />
          </div>
          <h2 className="text-2xl font-semibold text-estate-slate mb-2">Registration Submitted</h2>
          <p className="text-estate-steel mb-4">
            Thank you for your interest in Real Estate Private Club. Your registration has been received and will be reviewed manually by our team.
          </p>
          <p className="text-sm text-estate-charcoal mb-6">
            We'll contact you soon with next steps. For security reasons, registration approval is a manual process.
          </p>
          <div className="border border-estate-lightgrey rounded-md p-4 bg-estate-offwhite w-full">
            <p className="text-sm text-estate-steel mb-1">Registration Reference:</p>
            <p className="font-mono text-estate-navy">{`REG-${Math.floor(100000 + Math.random() * 900000)}`}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Real Estate Private Club</CardTitle>
        <CardDescription>
          Apply for membership to access exclusive real estate opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-estate-error">*</span></Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-estate-error">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-estate-error">*</span></Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company <span className="text-estate-error">*</span></Label>
            <Input
              id="company"
              name="company"
              placeholder="Enter your company name"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Your Role <span className="text-estate-error">*</span></Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer_mandatary">{getRoleLabel('buyer_mandatary')}</SelectItem>
                <SelectItem value="seller_mandatary">{getRoleLabel('seller_mandatary')}</SelectItem>
                <SelectItem value="investor">{getRoleLabel('investor')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Tell us about your real estate interests or experience..."
              rows={3}
              value={formData.message}
              onChange={handleChange}
            />
          </div>
          
          <div className="pt-4">
            <p className="text-xs text-estate-steel mb-4">
              By submitting this form, you agree to our strict confidentiality policies. All members must sign an NDA before accessing detailed information. Your application will be reviewed manually for security purposes.
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
