import { Tenant } from "@/lib/hooks/useTenant";
import { UserCheck, MessageSquare, Calendar, Star, Settings } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MentorDashboardProps {
  tenant: Tenant;
}

export function MentorDashboard({ tenant }: MentorDashboardProps) {
  const actions = [
    {
      title: "My Mentees",
      subtitle: "View and manage students you are mentoring",
      icon: UserCheck,
      href: "/admin/mentor/mentees",
      color: "bg-purple-500",
    },
    {
      title: "Requests",
      subtitle: "Manage incoming mentorship requests",
      icon: MessageSquare,
      href: "/admin/mentor/requests",
      color: "bg-pink-500",
    },
    {
      title: "Schedule",
      subtitle: "Manage your availability and sessions",
      icon: Calendar,
      href: "/admin/mentor/schedule",
      color: "bg-indigo-500",
    },
    {
      title: "Profile",
      subtitle: "Update your expertise and bio",
      icon: Star,
      href: "/admin/mentor/profile",
      color: "bg-orange-500",
    },
    {
      title: "Settings",
      subtitle: "Notification preferences and account settings",
      icon: Settings,
      href: "/admin/mentor/settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <UserCheck className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hello, {tenant.displayName}</h2>
            <p className="text-gray-500">Mentor Dashboard</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="block h-full">
              <Card className="h-full hover:shadow-md hover:border-purple-400 transition-all cursor-pointer">
                <CardHeader>
                   <div className={`${action.color} w-fit p-3 rounded-lg text-white mb-2`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.subtitle}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
