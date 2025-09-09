import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function JobListings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filters, setFilters] = useState({
    jobType: "",
    experienceLevel: "",
    salaryRange: "",
    companySize: "",
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs', { search: searchQuery, location: locationQuery, ...filters }],
    retry: false,
  });

  const handleSearch = () => {
    // Search is handled by the query key change
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Find Your Dream Job</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talent-primary focus:border-transparent transition-colors duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-job-search"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <Input
                  type="text"
                  placeholder="Location"
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talent-primary focus:border-transparent transition-colors duration-200"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  data-testid="input-location-search"
                />
              </div>
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-talent-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-talent-secondary transition-colors duration-200 flex items-center justify-center space-x-2 lg:w-auto"
              data-testid="button-search-jobs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Jobs</span>
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={filters.jobType === 'remote' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, jobType: prev.jobType === 'remote' ? '' : 'remote' }))}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              data-testid="filter-remote"
            >
              Remote
            </Button>
            <Button
              variant={filters.jobType === 'full_time' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, jobType: prev.jobType === 'full_time' ? '' : 'full_time' }))}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              data-testid="filter-full-time"
            >
              Full-time
            </Button>
            <Button
              variant={filters.jobType === 'part_time' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, jobType: prev.jobType === 'part_time' ? '' : 'part_time' }))}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              data-testid="filter-part-time"
            >
              Part-time
            </Button>
            <Button
              variant={filters.jobType === 'contract' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, jobType: prev.jobType === 'contract' ? '' : 'contract' }))}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              data-testid="filter-contract"
            >
              Contract
            </Button>
            <Button
              variant={filters.experienceLevel === 'entry' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, experienceLevel: prev.experienceLevel === 'entry' ? '' : 'entry' }))}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              data-testid="filter-entry-level"
            >
              Entry Level
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
              
              {/* Employment Type */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Employment Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Full-time</span>
                    <span className="ml-auto text-xs text-gray-500">(128)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Part-time</span>
                    <span className="ml-auto text-xs text-gray-500">(42)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Contract</span>
                    <span className="ml-auto text-xs text-gray-500">(38)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Remote</span>
                    <span className="ml-auto text-xs text-gray-500">(95)</span>
                  </label>
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Experience Level</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Entry level</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Mid level</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Senior level</span>
                  </label>
                </div>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Salary Range</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">$40K - $60K</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">$60K - $80K</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">$80K - $100K</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">$100K+</span>
                  </label>
                </div>
              </div>

              {/* Company Size */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Company Size</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Startup (1-50)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Mid-size (51-200)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox className="rounded border-gray-300 text-talent-primary focus:ring-talent-primary" />
                    <span className="ml-2 text-sm text-gray-700">Large (200+)</span>
                  </label>
                </div>
              </div>
              
              <Button className="w-full bg-talent-primary text-white py-2 rounded-lg font-medium hover:bg-talent-secondary transition-colors duration-200">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900" data-testid="text-job-count">{jobs?.length || 0}</span> jobs found
              </p>
              <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-talent-primary focus:border-transparent">
                <option>Most relevant</option>
                <option>Date posted</option>
                <option>Salary (high to low)</option>
                <option>Salary (low to high)</option>
              </select>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                          <div>
                            <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job: any) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    showFullDescription={true}
                    data-testid={`job-listing-${job.id}`}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {jobs && jobs.length > 0 && (
              <div className="flex items-center justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button size="sm" className="bg-talent-primary text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="px-3 py-2 text-gray-500">...</span>
                  <Button variant="outline" size="sm">12</Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
