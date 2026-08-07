import React from 'react'
import ContactUs from '@/features/client/components/Home/ContactUs'
import CustomersSay from '@/features/client/components/Home/CustomersSay'
import Frequently from '@/features/client/components/Home/Frequently'
import LineStyle from '@/features/client/components/Home/LineStyle'

export default function ContactUsPage() {
  return (
    <div>
      <ContactUs />
      <CustomersSay />
      <LineStyle />
      <Frequently />
    </div>
  )
}
