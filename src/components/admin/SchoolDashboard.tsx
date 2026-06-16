import { Tenant } from "@/lib/hooks/useTenant";
import { School, Users, Settings, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SchoolDashboardProps {
  tenant: Tenant;
}

export function SchoolDashboard({ tenant }: SchoolDashboardProps) {
  const profile = tenant.profile || {};
  
  const actions = [
    {
      title: "Manage Students",
      subtitle: "Add students, view profiles, and track progress",
      icon: Users,
      href: "/admin/school/students",
      color: "bg-blue-500",
    },
    {
      title: "School Profile",
      subtitle: "Update school details, contact info, and branding",
      icon: School,
      href: "/admin/school/profile",
      color: "bg-indigo-500",
    },
    {
      title: "Settings",
      subtitle: "Configure academic year, board, and preferences",
      icon: Settings,
      href: "/admin/school/settings",
      color: "bg-gray-500",
    },
    // Placeholders for future features
    {
      title: "Analytics",
      subtitle: "View student performance and career trends",
      icon: BookOpen,
      href: "/admin/school/analytics",
      color: "bg-emerald-500",
      comingSoon: true,
    },
     {
      title: "Career Events",
      subtitle: "Schedule career fairs and webinars",
      icon: GraduationCap,
      href: "/admin/school/events",
      color: "bg-orange-500",
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <School className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tenant.displayName}</h2>
            <p className="text-gray-500">{profile.address?.city ? `${profile.address.city}, ${profile.address.state}` : 'School Admin Dashboard'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          const cardClasses = `h-full hover:shadow-md transition-all ${
            action.comingSoon
              ? "opacity-70 cursor-not-allowed"
              : "hover:border-blue-400 cursor-pointer"
          }`;

          const content = (
            <CardHeader>
              <div className={`${action.color} w-fit p-3 rounded-lg text-white mb-2`}>
                <Icon className="w-6 h-6" />
              </div>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.subtitle}</CardDescription>
              {action.comingSoon && (
                <Badge variant="secondary" className="mt-2 w-fit">
                  Coming Soon
                </Badge>
              )}
            </CardHeader>
          );

          if (action.comingSoon) {
            return (
              <Card key={action.title} className={cardClasses}>
                {content}
              </Card>
            );
          }

          return (
            <Link key={action.title} href={action.href} className="block h-full">
              <Card className={cardClasses}>
                {content}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
