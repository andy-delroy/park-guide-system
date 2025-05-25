import SectionCard from '@/Components/SectionCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/parallax';
import MediaIndex from './Media/Index';

export default function Dashboard({ auth, recentImages = [] }) {
  const role = auth?.user?.role_name ?? 'guest';
  const [alert, setAlert] = useState(null); // For inline alert display

  useEffect(() => {
    const notifChannel = window.Echo.channel(`notifications.${role}`);
    console.log(`Subscribing to notifications.${role}...`);

    notifChannel.listen('.test', (event) => {
      console.log('Notification received:', event.message);
      Toastify({
        text: event.message || "New notification received",
        duration: 5000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#4fbe87",
      }).showToast();
    });

    // Park alert subscription (only if NOT admin)
    if (role !== 'admin') {
      const alertChannel = window.Echo.channel('alerts.public');
      console.log('Subscribing to alerts.public...');

      alertChannel.listen('.alert.created', (e) => {
        console.log('Park alert received:', e.alert);
        console.log('Recipients:', e.recipients);
        setAlert(e.alert);
      });

      return () => {
        window.Echo.leave('alerts.public');
      };
    }

    return () => {
      window.Echo.leave(`notifications.${role}`);
    };
  }, [role]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Sarawak Forestry Corporation
        </h2>
      }
    >
      <Head title="Home" />

      <div className="bg-white min-h-screen px-4 py-6">
        {/* Alert Message */}
        {alert && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative">
            <strong className="font-bold">Alert:</strong>
            <span className="ml-2">{alert.message}</span>
          </div>
        )}

        {/* Welcome Section */}
        <SectionCard>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Text Section (Left) */}
            <div className="md:w-2/3">
              <p className="text-lg font-medium text-gray-800">
                Welcome, {auth.user.full_name}!
              </p>
              <br />
              <p className="text-md text-justify text-gray-700 leading-relaxed">
                Sarawak Forestry Corporation (SFC) is a statutory body of the Sarawak Government formed under Sarawak Forestry Corporation Ordinance, 1995.
                <br /><br />
                Our main functions are to manage Totally Protected Areas (TPAs) and to conserve Biodiversity of Sarawak. We have been entrusted to protect the wildlife of Sarawak, particularly the totally protected and protected species. In doing this, we are governed by the National Parks and Nature Reserves Ordinance 1998 and the Wild Life Protection Ordinance, 1998.
              </p>
            </div>

            {/* Swiper Section (Right) */}
            <div className="md:w-1/3 h-[250px]">
              <Swiper
                direction="vertical"
                speed={2500}
                parallax={true}
                loop={true}
                loopedSlides={4}
                allowTouchMove={false}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false
                }}
                modules={[Autoplay, Parallax]}
                className="h-full w-full"
              >
                {[{
                  title: `To be an agency of excellence in the conservation of Sarawak's wildlife and its totally protected areas for all people, for all time.`,
                  subtitle: 'Our Vision',
                },
                {
                  title: `To create, maintain totally protected areas and to conserve wildlife through innovation and best practices for the equitable benefits for all.`,
                  subtitle: 'Our Mission',
                },
                {
                  title: `Integrity, Kind and Caring, Professionalism, Sense of Urgency and Ownership, Team Spirit & Result-Oriented.`,
                  subtitle: 'Our Values',
                },
                {
                  title: `New Frontier in Biodiversity Conservation.`,
                  subtitle: 'Our Tagline',
                }].map((slide, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative flex h-full px-6 py-8 items-start text-justify">
                      
                      {/* Background Decorative Parallax Layer */}
                      <div
                        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-100 to-transparent opacity-30"
                        data-swiper-parallax="-600"
                      />

                      {/* Main Content */}
                      <div className="relative z-10 max-w-xs space-y-3">
                        <h2
                          className="text-lg md:text-xl font-bold text-gray-800 leading-snug"
                          data-swiper-parallax="-400"
                        >
                          <span className="text-orange-300 text-2xl font-extrabold">“</span>
                          {slide.title}
                          <span className="text-orange-300 text-2xl font-extrabold">”</span>
                        </h2>
                        <h3
                          className="text-md font-semibold text-gray-600"
                          data-swiper-parallax="-200"
                        >
                          {slide.subtitle}
                        </h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </SectionCard>
        <MediaIndex />
      </div>

      {/* recent captures */}
      {role === 'admin' && recentImages?.length > 0 && (
        <div className="mx-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">🧟 Recent Captures</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentImages.map((img, idx) => (
              <div key={idx} className="bg-white border shadow rounded overflow-hidden">
                <img src={img.url} alt={img.filename} className="w-full h-48 object-cover" />
                <div className="text-sm p-2 text-gray-600 text-center">{img.filename}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
