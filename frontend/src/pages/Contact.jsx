import React, { useState, useContext } from "react";
import axios from "axios";
import Navbar from "../component/Nav";
import Footer from "../component/Footer";
import { authDataContext } from "../context/AuthContext";

function Contact() {
  const { serverUrl } = useContext(authDataContext); // Get backend URL from context

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/contact/send`,
        formData
      );
      setStatus(res.data.message);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus(error.response?.data?.message || "Failed to send message ❌");
    }
    setLoading(false);
    setTimeout(() => setStatus(""), 3000);
  };

  // ...Rest of the JSX (same as before)
  const contactCards = [
    {
      title: "Office",
      details: [
        "Neerukonda Village",
        "SRM University AP, Mangalagiri",
        "Andhra Pradesh 522502",
      ],
      icon: "📍",
    },
    {
      title: "Phone",
      details: ["+91-9798786431", "Mon-Fri: 9AM–6PM"],
      icon: "📞",
    },
    {
      title: "Email",
      details: ["ayushdvlpr460@gmail.com"],
      icon: "📩",
    },
  ];

  const faqItems = [
    {
      q: "How long does it take to receive a reply?",
      a: "We typically reply within 24 hours during business days.",
    },
    {
      q: "Do you offer phone support?",
      a: "Yes — Available Mon to Fri, 9 AM to 6 PM.",
    },
    {
      q: "Can I schedule a visit?",
      a: "Yes — just send us a message & we'll coordinate.",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="w-[99vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-hidden">

        {/* HERO */}
        <section className="text-center py-24">
          <h1 className="text-4xl font-bold tracking-wide">
            CONTACT <span className="text-[#46d1f7]">US</span>
          </h1>
          <div className="mt-2 w-[80px] h-[3px] bg-[#46d1f7] mx-auto"></div>
          <p className="mt-4 text-gray-300">
            We'd love to hear from you. Let’s connect!
          </p>
        </section>

        {/* CONTACT INFO */}
        <section className="py-2">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
            {contactCards.map((c, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg border border-[#9ff9f9]/20 p-6 rounded-xl text-center shadow-lg"
              >
                <div className="text-4xl">{c.icon}</div>
                <h3 className="text-xl font-semibold mt-3 text-[#9ff9f9]">{c.title}</h3>
                {c.details.map((d, j) => (
                  <p key={j} className="text-gray-300 text-sm mt-1">
                    {d}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* FORM + MAP */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-4">

            {/* FORM */}
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Send us a <span className="text-[#46d1f7]">Message</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Fill out the form & we’ll respond shortly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Full Name *"
                    required
                    onChange={handleChange}
                    className="bg-[#0f2a30] border border-[#46d1f7]/40 p-3 rounded-lg w-full outline-none focus:border-[#9ff9f9]"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email Address *"
                    required
                    onChange={handleChange}
                    className="bg-[#0f2a30] border border-[#46d1f7]/40 p-3 rounded-lg w-full outline-none focus:border-[#9ff9f9]"
                  />
                </div>

                <select
                  name="subject"
                  value={formData.subject}
                  required
                  onChange={handleChange}
                  className="bg-[#0f2a30] border border-[#46d1f7]/40 p-3 rounded-lg w-full outline-none focus:border-[#9ff9f9]"
                >
                  <option value="">Select Subject *</option>
                  <option value="General">General Inquiry</option>
                  <option value="Support">Support Request</option>
                  <option value="Business">Business Proposal</option>
                </select>

                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  placeholder="Your Message *"
                  required
                  onChange={handleChange}
                  className="bg-[#0f2a30] border border-[#46d1f7]/40 p-3 rounded-lg w-full outline-none focus:border-[#9ff9f9]"
                ></textarea>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#46d1f7] hover:bg-[#5df9ff] text-black px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                {status && (
                  <p className="font-semibold text-[#9ff9f9] mt-2">{status}</p>
                )}
              </form>
            </div>

            {/* MAP */}
            <div className="rounded-xl overflow-hidden shadow-lg border border-[#46d1f7]/30">
              <iframe
                width="100%"
                height="100%"
                className="min-h-[350px]"
                loading="lazy"
                src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=SRM+University+AP,+Neerukonda,+Andhra+Pradesh+(SRM+AP)&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
              ></iframe>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-10">
            FAQ <span className="text-[#46d1f7]">Help Desk</span>
          </h2>

          <div className="max-w-4xl mx-auto grid gap-6 px-4">
            {faqItems.map((f, i) => (
              <div
                key={i}
                className="bg-white/10 border border-[#46d1f7]/30 p-5 rounded-lg shadow"
              >
                <h3 className="font-semibold text-lg text-[#9ff9f9]">{f.q}</h3>
                <p className="text-gray-300 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default Contact;
