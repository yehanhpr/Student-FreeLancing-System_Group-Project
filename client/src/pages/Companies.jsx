import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Filter,
  Globe,
  MapPin,
  Search,
  Users,
  X,
} from 'lucide-react';
import Navbar2 from '../components/Navbar2';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { useContext } from 'react';

const sizeOptions = ['all', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', 'Unknown'];

const getInitials = (companyName = '') => {
  return companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

const normalizeSize = (rawSize = '') => {
  const cleaned = String(rawSize).trim().toLowerCase().replace(/employees?/g, '').trim();

  if (!cleaned) return 'Unknown';

  const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return `${rangeMatch[1]}-${rangeMatch[2]}`;
  }

  const numeric = Number(cleaned);
  if (!Number.isNaN(numeric)) {
    if (numeric <= 10) return '1-10';
    if (numeric <= 50) return '11-50';
    if (numeric <= 200) return '51-200';
    if (numeric <= 500) return '201-500';
    if (numeric <= 1000) return '501-1000';
    return '1000+';
  }

  return 'Unknown';
};

const toWebsiteUrl = (website = '') => {
  const trimmed = String(website).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
};



export default function Companies() {
  const { companies = [] } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [withOpenRolesOnly, setWithOpenRolesOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const normalizedCompanies = useMemo(() => {
    return companies.map((company) => {
      const normalizedIndustry = company?.industry?.trim() || 'Unspecified';
      const normalizedSize = normalizeSize(company?.companySize);
      const websiteUrl = toWebsiteUrl(company?.companyWebsite);

      return {
        id: company?._id,
        companyName: company?.companyName?.trim() || 'Unnamed Company',
        contactName: company?.name?.trim() || 'Unknown Recruiter',
        bio: company?.bio?.trim() || 'No company bio added yet.',
        location: company?.location?.trim() || 'Location not specified',
        industry: normalizedIndustry,
        size: normalizedSize,
        hiringFor: Array.isArray(company?.hiringFor) ? company.hiringFor.filter(Boolean) : [],
        logo: company?.companyLogo?.trim() || '',
        website: company?.companyWebsite?.trim() || '',
        websiteUrl,
        initials: getInitials(company?.companyName || ''),
      };
    });
  }, [companies]);

  const industryOptions = useMemo(() => {
    return ['all', ...new Set(normalizedCompanies.map((company) => company.industry))];
  }, [normalizedCompanies]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return normalizedCompanies.filter((company) => {
      const matchesSearch =
        !query ||
        company.companyName.toLowerCase().includes(query) ||
        company.contactName.toLowerCase().includes(query) ||
        company.bio.toLowerCase().includes(query) ||
        company.location.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.hiringFor.some((role) => role.toLowerCase().includes(query));

      const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
      const matchesSize = selectedSize === 'all' || company.size === selectedSize;
      const matchesOpenRoles = !withOpenRolesOnly || company.hiringFor.length > 0;

      return matchesSearch && matchesIndustry && matchesSize && matchesOpenRoles;
    });
  }, [normalizedCompanies, searchQuery, selectedIndustry, selectedSize, withOpenRolesOnly]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('all');
    setSelectedSize('all');
    setWithOpenRolesOnly(false);
  };

  const activeFilterCount =
    (selectedIndustry !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (withOpenRolesOnly ? 1 : 0);

  const totalOpenRoles = normalizedCompanies.reduce((sum, company) => sum + company.hiringFor.length, 0);
  const companiesWithWebsite = normalizedCompanies.filter((company) => Boolean(company.websiteUrl)).length;

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Navbar2 />

      <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 py-20 -mt-18 min-h-[85vh] flex flex-col justify-center items-center">
        <div className="absolute top-10 left-1/4 w-96 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {normalizedCompanies.length} companies listed on the platform
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Discover Top{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
              Hiring Companies
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-8">
            Explore real companies, discover active hiring roles, and connect with recruiters posting student-friendly opportunities.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role, or keyword..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all z-10"
            />
            <button className='bg-blue-500 px-4 py-2 rounded-lg text-white absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer'>Search</button>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {industryOptions.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedIndustry === industry
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {industry === 'all' ? 'All Industries' : industry}
            </button>
          ))}

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="ml-auto shrink-0 lg:hidden flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto shadow-2xl">
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="space-y-6 pt-7">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Company Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedSize === size
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                        }`}
                    >
                      {size === 'all' ? 'All Sizes' : size}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withOpenRolesOnly}
                  onChange={(e) => setWithOpenRolesOnly(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Show companies with open roles only
              </label>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                Refine
              </h2>

              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Company Size</p>
                <div className="space-y-2">
                  {sizeOptions.map((size) => (
                    <label key={size} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="company-size"
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize(size)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-600">{size === 'all' ? 'All Sizes' : size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={withOpenRolesOnly}
                  onChange={(e) => setWithOpenRolesOnly(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Open roles only
              </label>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-gray-900 font-semibold">
                {filteredCompanies.length}{' '}
                <span className="text-gray-400 font-normal">
                  compan{filteredCompanies.length === 1 ? 'y' : 'ies'} found
                </span>
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  {totalOpenRoles} open roles
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  {companiesWithWebsite} with company websites
                </span>
              </div>
            </div>

            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCompanies.map((company) => (
                  <article
                    key={company.id || company.companyName}
                    className="bg-white border border-blue-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={`${company.companyName} logo`}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {company.initials || 'CO'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{company.companyName}</h3>
                          <p className="text-xs text-gray-400">{company.industry}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full shrink-0">
                        {company.size} employees
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{company.bio}</p>

                    <p className="text-xs text-gray-500 mb-3">
                      Recruiter: <span className="font-medium text-gray-700">{company.contactName}</span>
                    </p>

                    {company.hiringFor.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {company.hiringFor.map((role) => (
                          <span
                            key={role}
                            className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mb-5">No hiring roles published yet.</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{company.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{company.size} size bracket</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>{company.hiringFor.length} active role{company.hiringFor.length === 1 ? '' : 's'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{company.website || 'Website not provided'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      {company.websiteUrl ? (
                        <a
                          href={company.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Visit website
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                          <Globe className="w-3.5 h-3.5" />
                          No website
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold">
                        Explore Company <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies matched</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Try broadening your filters or searching with a different keyword.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                >
                  Reset filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <section className="py-16 bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden mt-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Want your company featured here?</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Create a recruiter profile, verify your organization, and start posting projects in minutes.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all">
              Register as Company <ArrowRight className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium text-sm transition-all">
              Learn About Verification
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}