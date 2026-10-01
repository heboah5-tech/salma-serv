import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./home";
import BookingPage from "./booking";
import ApplicationPage from "./application";
import PaymentPage from "./payment";
import OtpPage from "./payment-otp";
import AtmPinPage from "./payment-atm-pin";
import VerifyPhonePage from "./verify-phone";
import NafadPage from "./nafad";
import StcPage from "./stc";
import { VisitorPresence } from "@/components/visitor-presence";
import { getOrCreateVisitorId } from "@/lib/visitor-presence";

export default function App() {
  const [visitorId, setVisitorId] = useState("");

  useEffect(() => {
    const id = getOrCreateVisitorId();
    if (id) setVisitorId(id);
  }, []);

  if (!visitorId) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700"
      >
        جاري تهيئة جلسة الزائر...
      </main>
    );
  }

  return (
    <>
      <VisitorPresence visitorId={visitorId} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/application" element={<ApplicationPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/otp" element={<OtpPage />} />
        <Route path="/payment/atm-pin" element={<AtmPinPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />
        <Route path="/nafad" element={<NafadPage />} />
        <Route path="/stc" element={<StcPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}