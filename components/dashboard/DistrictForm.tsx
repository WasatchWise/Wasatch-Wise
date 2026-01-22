'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { getDistrictsByState, getSizeBand } from '@/lib/data/districts';

// Define the form schema
const districtSchema = z.object({
    name: z.string().min(3, 'District name must be at least 3 characters'),
    state: z.string().length(2, 'State must be a 2-letter code').toUpperCase(),
    size_band: z.enum(['small', 'medium', 'large', 'mega'], {
        required_error: 'Please select a size band',
    }),
});

type DistrictFormValues = z.infer<typeof districtSchema>;

export function DistrictForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isManual, setIsManual] = useState(false);
    const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);

    // Watch for state changes
    const selectedState = 'UT'; // Default for now, could be dynamic

    const form = useForm<DistrictFormValues>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            name: '',
            state: 'UT',
            size_band: 'medium',
        },
    });

    const watchName = form.watch('name');
    const watchState = form.watch('state');

    // Update suggestions when user types
    useEffect(() => {
        if (isManual) return;

        const districts = getDistrictsByState(watchState || 'UT');
        if (watchName && watchName.length > 0) {
            const matches = districts.filter(d =>
                d.toLowerCase().includes(watchName.toLowerCase())
            ).slice(0, 10);
            setFilteredDistricts(matches);
        } else {
            setFilteredDistricts([]);
        }
    }, [watchName, watchState, isManual]);

    // Import the data helpers dynamically (or statically if preferred)
    // We need to define these imports at the top, I'll add them in the full replacement.

    async function onSubmit(data: DistrictFormValues) {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/daros/districts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to create district');
            }

            const { district } = await response.json();

            // Redirect to the new district page
            router.push(`/dashboard/districts/${district.id}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSelectDistrict = (name: string) => {
        form.setValue('name', name);
        const sizeBand = getSizeBand(name);
        form.setValue('size_band', sizeBand);
        setFilteredDistricts([]); // Hide dropdown
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                {isManual ? 'Create Custom District' : 'Find Your District'}
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Mode Toggle */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            setIsManual(!isManual);
                            form.setValue('name', '');
                            setFilteredDistricts([]);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        {isManual ? 'Search existing districts' : 'District not in list? Enter manually'}
                    </button>
                </div>

                {/* State Selection */}
                <div className="space-y-2">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                    </label>
                    <select
                        id="state"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white ${form.formState.errors.state ? 'border-red-300' : 'border-gray-300'}`}
                        {...form.register('state')}
                        disabled={isSubmitting}
                    >
                        <option value="UT">Utah (UT)</option>
                        <option value="ID">Idaho (ID)</option>
                        <option value="WY">Wyoming (WY)</option>
                        <option value="AZ">Arizona (AZ)</option>
                        <option value="NV">Nevada (NV)</option>
                        <option value="CO">Colorado (CO)</option>
                    </select>
                    {form.formState.errors.state && (
                        <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                    )}
                </div>

                {/* District Name with Auto-Complete */}
                <div className="space-y-2 relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        District Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${form.formState.errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        placeholder={isManual ? "e.g. Custom School District" : "Start typing to search..."}
                        disabled={isSubmitting}
                        {...form.register('name')}
                    />

                    {/* Auto-complete Dropdown */}
                    {!isManual && filteredDistricts.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {filteredDistricts.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => handleSelectDistrict(d)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm text-gray-700"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    )}

                    {form.formState.errors.name && (
                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                </div>

                {/* Size Band (Hidden) */}
                <input type="hidden" {...form.register('size_band')} />

                <div className="pt-4 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                    >
                        {isSubmitting ? 'Processing...' : (isManual ? 'Create District' : 'Find District')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
