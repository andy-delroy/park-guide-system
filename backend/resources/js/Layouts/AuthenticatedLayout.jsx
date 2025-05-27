import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
//import List from '@/Pages/Notifications/List';
import NotificationList from '../Pages/Notifications/List';

export default function AuthenticatedLayout({ header, children, showBackButton = false, backHref = '/' }) {
    const user = usePage().props.auth.user;
    const role = user?.role_name ?? 'visitor';

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { props } = usePage();
    const auth = props.auth;
    
    return (
        <div className="bg-white flex relative h-screen overflow-hidden">
            {/* Sidebar */}
            <nav
                className={`${
                    sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-60'
                } transition-all duration-300 bg-[--forest-green] h-screen fixed sm:block hidden`}
            >
                <div className="flex flex-col h-full pt-3">
                    <div className="flex items-center justify-center mb-3">
                        <Link href="/">
                            <ApplicationLogo className="h-14 w-auto" />
                        </Link>
                    </div>

                    <div className="flex flex-col flex-grow">
                        <NavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Home
                        </NavLink>
                        {role === 'admin' && (
                            <>
                                <NavLink
                                    href={route('iot.dashboard')}
                                    active={route().current('iot.dashboard')}
                                >
                                    IoT Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('analytics.index')}
                                    active={route().current('analytics.index')}
                                >
                                    Guide Analytics
                                </NavLink>
                                <NavLink
                                    href={route('guides.index')}
                                    active={route().current('guides.index')}
                                >
                                    Guides
                                </NavLink>
                            </>
                        )}
                        {(role === 'admin' || role === 'guide') && (
                            <>
                                <NavLink
                                    href={route('courses.index')}
                                    active={route().current('courses.index')}
                                >
                                    Courses
                                </NavLink>
                                {/* <NavLink
                                    href={route('quiz.index')}
                                    active={route().current('quiz.index')}
                                >
                                    Quiz
                                </NavLink> */}
                                {(role === 'guide') && (
                                    <NavLink
                                        href={route('mentormentee.index')}
                                        active={route().current('mentormentee.index')}
                                    >
                                        MentorMentee
                                    </NavLink>
                                )}
                                <NavLink
                                    href={route('trainings.index')}
                                    active={route().current('trainings.index')}
                                >
                                    Trainings
                                </NavLink>
                                <NavLink
                                    href={route('certification.index', { type: 'certificate' })}
                                    active={route().current('certification.index') && route().params.type !== 'license'}
                                >
                                    Certification
                                </NavLink>

                                <NavLink
                                    href={route('certification.index', { type: 'license' })}
                                    active={route().current('certification.index') && route().params.type === 'license'}
                                >
                                    License
                                </NavLink>
                            </>
                        )}
                        {(role === 'admin') && (
                            <NavLink
                                href={route('payments.index')} active={route().current('payments.index')}
                            >
                                Payment
                            </NavLink>
                        )}
                        {(role === 'admin') && (
                            <NavLink
                                href={route('notifications.broadcast')}
                                active={route().current('notifications.broadcast')}
                            >
                                Send Notifications
                            </NavLink>
                        )}
                        <NavLink
                            href={route('map.parkmap')}
                            active={route().current('map.parkmap')}
                        >
                            Map
                        </NavLink>
                        <NavLink
                            href={route('profile.edit')}
                            active={route().current('profile.edit')}
                        >
                            Profile
                        </NavLink>

                        <div className="flex-grow" />

                        <NavLink
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full text-left"
                        >
                            Log Out
                        </NavLink>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${
                    sidebarCollapsed ? 'ml-0' : 'sm:ml-60'
                }`}
            >
                {/* Mobile Nav (top bar toggle) */}
                <div className="sm:hidden border-b border-gray-100 bg-[--forest-green] p-4 flex justify-between items-center">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>

                    <button
                        onClick={() =>
                            setShowingNavigationDropdown((prev) => !prev)
                        }
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                className={
                                    !showingNavigationDropdown
                                        ? 'inline-flex'
                                        : 'hidden'
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                            <path
                                className={
                                    showingNavigationDropdown
                                        ? 'inline-flex'
                                        : 'hidden'
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Dropdown Mobile Menu */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2 px-4 bg-white border-b">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Home
                        </ResponsiveNavLink>
                        {role === 'admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('iot.dashboard')}
                                    active={route().current('iot.dashboard')}
                                >
                                    IoT Dashboard
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('analytics.index')}
                                    active={route().current('analytics.index')}
                                >
                                    Guide Analytics
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('guides.index')}
                                    active={route().current('guides.index')}
                                >
                                    Guides
                                </ResponsiveNavLink>
                            </>
                        )}
                        {(role === 'admin' || role === 'guide') && (
                            <>
                                <ResponsiveNavLink
                                    href={route('courses.index')}
                                    active={route().current('courses.index')}
                                >
                                    Courses
                                </ResponsiveNavLink>
                                {/* <ResponsiveNavLink
                                    href={route('quiz.index')}
                                    active={route().current('quiz.index')}
                                >
                                    Quiz
                                </ResponsiveNavLink> */}
                                {(role === 'guide') && (
                                    <ResponsiveNavLink
                                        href={route('mentormentee.index')}
                                        active={route().current('mentormentee.index')}
                                    >
                                        MentorMentee
                                    </ResponsiveNavLink>
                                )}
                                <ResponsiveNavLink
                                    href={route('trainings.index')}
                                    active={route().current('trainings.index')}
                                >
                                    Trainings
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('certification.index', { type: 'certificate' })}
                                    active={route().current('certification.index') && route().params.type !== 'license'}
                                >
                                    Certification
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('certification.index', { type: 'license' })}
                                    active={route().current('certification.index') && route().params.type === 'license'}
                                >
                                    License
                                </ResponsiveNavLink>
                            </>
                        )}
                        <ResponsiveNavLink
                            href={route('map.parkmap')}
                            active={route().current('map.parkmap')}
                        >
                            Map
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 px-4 bg-white">
                        <div className="text-base font-medium text-gray-800">
                            {user.name}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {user.email}
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>

                {/* Header */}
                {header && (
                    <header className="sticky top-0 z-50 bg-stone-200 backdrop-blur-md">
                        <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
                            {/* Sidebar toggle button (desktop only) */}
                            {!showBackButton && (
                                <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="sm:flex hidden items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                            >
                                {sidebarCollapsed ? (
                                    // Hamburger icon (collapsed)
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                ) : (
                                    // X icon (expanded)
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </button>)}

                            {/* Back Button */}
                            {showBackButton && (
                                <Link
                                    href={backHref}
                                    className="sm:flex hidden items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                                >
                                    <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>

                                </Link>
                            )}

                            {/* Header Content */}
                            <div className="flex-grow">
                                {header}
                            </div>

                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="sm:flex hidden items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                                >
                                    {/* Bell Icon (Heroicons) */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>

                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-md border border-gray-200 z-50">
                                        <div className="p-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Notifications</h3>
                                        <NotificationList auth={auth} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                )}


                {/* Main */}
                <main>{children}</main>
            </div>
        </div>
    );
}
