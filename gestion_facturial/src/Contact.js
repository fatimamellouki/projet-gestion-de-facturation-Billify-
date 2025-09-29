import ReCAPTCHA from "react-google-recaptcha";
import React, { useState } from "react";
import Footer from './FooterSection';
const LEFT_IMAGE = "https://www.callcentertunisie.com/wp-content/uploads/2020/12/call-center3.jpg";
const SITE_KEY = "6LfzdYkrAAAAAMoU7kD07T_GyuDqbicwg1_PYVWu"; 

function Contacts() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    country: "Hong Kong",
    phone: "",
    message: "",
    recaptcha: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Please complete this required field.";
    if (!form.lastName.trim()) e.lastName = "Please complete this required field.";
    if (!form.email.trim()) e.email = "Please complete this required field.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email.";
    // if (!form.company.trim()) e.company = "Please complete this required field.";
    // if (!form.jobTitle.trim()) e.jobTitle = "Please complete this required field.";
    if (!form.phone.trim()) e.phone = "Please complete this required field.";
    if (!form.message.trim()) e.message = "Please complete this required field.";
    if (!form.recaptcha) e.recaptcha = "Please complete the reCAPTCHA verification.";
    return e;
  };

  const handleCaptcha = (value) => {
    setForm(prev => ({ ...prev, recaptcha: value }));
    // Clear recaptcha error if it exists
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (ev) => {
  ev.preventDefault();
  const validationErrors = validate();
  setErrors(validationErrors);
  
  if (Object.keys(validationErrors).length === 0) {
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Erreur réseau');
      }

      const result = await response.json();
      alert("Message envoyé avec succès !");
      
      // Réinitialiser le formulaire
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        jobTitle: "",
        country: "Hong Kong",
        phone: "",
        message: "",
        recaptcha: "",
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      alert("Une erreur s'est produite lors de l'envoi du message.");
    } finally {
      setSubmitting(false);
    }
  }
};
  return (
    <main  className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-16 md:pt-32 md:pb-2">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* LEFT: Title + image */}
        <div className="px-2 lg:px-6">
          <p className="text-sm font-semibold text-blue-600 mb-4"><h3><strong>Contact Us</strong></h3></p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-600 leading-tight mb-4">We're here for you!</h1>
          <p className="text-gray-600 max-w-xl mb-8">
            We are here to answer any queries you may have about our products. Please complete this form and we will respond to you as soon as we can.
          </p>
          <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-lg">
            <img src={LEFT_IMAGE} alt="Contact" className="w-full h-64 object-cover rounded-xl" />
            {/* decorative chat bubbles */}
            <div className="absolute -left-6 top-10 bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            <div className="absolute -left-6 bottom-6 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center shadow-md"></div>
            <div className="absolute -right-6 bottom-16 bg-indigo-300 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute right-6 top-2 bg-blue-500 rounded-full w-4 h-4 shadow-md"></div>
          </div>
        </div>

        {/* RIGHT: Form card */}
        <div className="px-2 lg:px-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl p-8 md:p-10 border border-gray-100"
            noValidate
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                    className={`w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 ${errors.firstName ? "border-red-400" : "border-gray-300"}`}                  placeholder="First name*"
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
className={`w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 ${errors.lastName ? "border-red-400" : "border-gray-300"}`}                  placeholder="Last name*"
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="mb-4">
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 ${errors.email ? "border-red-400" : "border-gray-300"}`}               placeholder="Email Address*"
                type="email"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
className={`w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 ${errors.company ? "border-red-400" : "border-gray-300"}`}                placeholder="Company / Organization*"
              />
              {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
            </div>

            <div className="mb-4">
              <input
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
className={`w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 ${errors.jobTitle ? "border-red-400" : "border-gray-300"}`}                placeholder="Job Title*"
              />
              {errors.jobTitle && <p className="text-xs text-red-500 mt-1">{errors.jobTitle}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-end">
              <div>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 border-gray-300"
                  placeholder="Country"
               >
                  <option>Hong Kong</option>
                  <option>France</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                    <option>Germany</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>India</option>
                    <option>Japan</option>
                    <option>Brazil</option>
                    <option>South Africa</option>
                    <option>Mexico</option>
                    <option>Italy</option>
                    <option>Spain</option>
                    <option>Maroc</option>
                </select>
                </div>

                <div>
                <div className="flex gap-3">
                        <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 ${errors.phone ? "border-red-400" : "border-gray-300"}`}                    placeholder="Business Phone*"
                    />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
            </div>

            <div className="mb-4">
                <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you?*"
                className={`w-full border-0 border-b-2 focus:outline-none focus:ring-0 py-2 ${errors.message ? "border-red-400" : "border-gray-300"}`}              />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center mb-4">
               <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={handleCaptcha}
              />
              {errors.recaptcha && <p className="text-xs text-red-500 mt-1 text-center">{errors.recaptcha}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-md font-semibold shadow transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "SUBMIT"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
export default function Contact(){
    return (
        <>
        <Contacts />
<div className="map-container" style={{ overflow: 'hidden', paddingBottom: '56.25%', position: 'relative', height: 0, marginBottom:"10px" }}>
  <iframe
        title="NewDev Maroc Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.99672480809!2d-5.008920325638926!3d34.01829501952436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9f8b199ecf93d1%3A0xc85af5fa27991596!2sNewDev%20Maroc!5e0!3m2!1sfr!2sma!4v1755371549037!5m2!1sfr!2sma"
        
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{boxSizing:"border-box", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' , border: 0 , borderRadius: '8px' , boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'} }
      ></iframe>
    </div>
            <Footer />
        </>
    );
}