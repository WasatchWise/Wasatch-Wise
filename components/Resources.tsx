import React, { useState, useMemo } from 'react';
import { LifebuoyIcon, ShoppingBagIcon, ShareIcon } from './icons';

const resources = [
  {
    name: 'Community Food Share',
    description: 'A local food bank providing nutritious food to families and individuals in need across Boulder and Broomfield Counties.',
    link: '#', // Placeholder link
    icon: <ShoppingBagIcon className="w-8 h-8 text-sanctuary-green" />,
  },
  {
    name: 'Longmont OUR Center',
    description: 'Offers various services including a food pantry, daily meals, housing assistance, and utility bill support.',
    link: '#', // Placeholder link
    icon: <LifebuoyIcon className="w-8 h-8 text-dignity-purple" />,
  },
  {
    name: 'EFAA - Emergency Family Assistance',
    description: 'Helps families in Boulder County meet their basic needs, including food, housing, and financial assistance.',
    link: '#', // Placeholder link
    icon: <LifebuoyIcon className="w-8 h-8 text-shield-blue" />,
  },
];

interface Resource {
    name: string;
    description: string;
    link: string;
    icon: React.ReactNode;
}

interface ResourceCardProps extends Resource {
  onShare: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ name, description, link, icon, onShare }) => {
  const canShare = typeof navigator.share === 'function';

  return (
    <div className="bg-surface-primary rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 border border-surface-tertiary">
      <div>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-surface-secondary flex items-center justify-center mr-4">
            {icon}
          </div>
          <h3 className="text-lg font-bold font-display text-secure-slate">{name}</h3>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center block bg-white text-sanctuary-green border border-sanctuary-green font-semibold py-2 px-4 rounded-md hover:bg-sanctuary-green/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors text-sm"
        >
          Visit Website
        </a>
        {canShare && (
            <button
                onClick={onShare}
                className="flex-1 flex items-center justify-center bg-white text-sanctuary-green border border-sanctuary-green font-semibold py-2 px-4 rounded-md hover:bg-sanctuary-green/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors text-sm"
            >
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
            </button>
        )}
      </div>
    </div>
  );
};

export const Resources: React.FC = () => {
  const [sortOption, setSortOption] = useState('default');

  const sortedResources = useMemo(() => {
    const [key, direction] = sortOption.split('-');
    if (key === 'default' || !key || !direction) {
      return resources;
    }

    return [...resources].sort((a, b) => {
      const valueA = a[key as 'name' | 'description'].toLowerCase();
      const valueB = b[key as 'name' | 'description'].toLowerCase();

      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [sortOption]);

  const handleShareResource = async (resource: Omit<Resource, 'icon'>) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Resource from The Help List: ${resource.name}`,
                text: `${resource.name}: ${resource.description}`,
                url: window.location.href, // Share a link back to the app
            });
        } catch (error) {
            console.error('Error sharing resource:', error);
        }
    }
  };

  return (
    <div className="bg-surface-primary p-8 rounded-xl shadow-xl border border-surface-tertiary">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-secure-slate">Community Resources</h2>
          <p className="mt-2 text-gray-600 max-w-2xl">
            In addition to grocery help, several local organizations offer valuable support. Here are a few trusted resources in the area.
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-end flex-shrink-0">
            <label htmlFor="resource-sort" className="text-sm font-medium text-secure-slate">
                Sort by:
            </label>
            <select
                id="resource-sort"
                name="resource-sort"
                className="block w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-dignity-purple focus:border-dignity-purple sm:text-sm rounded-md shadow-sm"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
            >
                <option value="default">Default</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="description-asc">Description (A-Z)</option>
                <option value="description-desc">Description (Z-A)</option>
            </select>
        </div>
      </div>
      <div className="space-y-6">
        {sortedResources.map((resource) => (
          <ResourceCard key={resource.name} {...resource} onShare={() => handleShareResource(resource)} />
        ))}
      </div>
    </div>
  );
};
