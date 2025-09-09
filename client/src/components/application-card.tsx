import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ApplicationCardProps {
  application: any;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'interview_scheduled': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'hired': 'bg-purple-100 text-purple-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'under_review': 'Under Review',
      'interview_scheduled': 'Interview Scheduled',
      'rejected': 'Not Selected',
      'hired': 'Hired',
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Applied yesterday";
    if (diffDays < 7) return `Applied ${diffDays} days ago`;
    if (diffDays < 30) return `Applied ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Applied on ${date.toLocaleDateString()}`;
  };

  return (
    <motion.div
      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      whileHover={{ x: 2 }}
      data-testid={`application-${application.id}`}
    >
      <div className="flex items-center space-x-4">
        <img
          src={application.companyLogo || "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
          alt="Company logo"
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{application.jobTitle}</h3>
          <p className="text-sm text-gray-600">{application.companyName}</p>
          <p className="text-xs text-gray-500">{formatDate(application.appliedAt)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Badge
          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}
        >
          {getStatusDisplay(application.status)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-600"
          data-testid={`button-view-application-${application.id}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </motion.div>
  );
}
