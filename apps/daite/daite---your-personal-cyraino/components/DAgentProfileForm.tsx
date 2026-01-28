
import React from 'react';
import { DAgentProfile, AgentPersonaType, RelationshipGoal, CommunicationTone } from '../types';
import { AGENT_PERSONA_TYPE_OPTIONS, RELATIONSHIP_GOAL_OPTIONS } from '../constants';
import { RobotIcon } from './icons/RobotIcon'; 
import { SparklesIcon } from './icons/SparklesIcon';

interface DAgentProfileFormProps {
  profile: DAgentProfile;
  onProfileChange: <K extends keyof DAgentProfile>(field: K, value: DAgentProfile[K]) => void;
  onToneChange: (toneKey: keyof CommunicationTone, value: number) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

const FormRow: React.FC<{ label: string; htmlFor: string; children: React.ReactNode; description?: string }> = ({ label, htmlFor, children, description }) => (
  <div className="mb-6">
    <label htmlFor={htmlFor} className="block text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
      {label}
    </label>
    {children}
    {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
  </div>
);

const TextInput: React.FC<{id: string; value: string; onChange: (val: string) => void; placeholder?: string;}> = ({ id, value, onChange, placeholder }) => (
  <input
    type="text"
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-gray-100 placeholder-slate-400"
  />
);

const TextAreaInput: React.FC<{id: string; value: string; onChange: (val: string) => void; rows?: number; placeholder?: string;}> = ({ id, value, onChange, rows = 3, placeholder }) => (
  <textarea
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    placeholder={placeholder}
    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-gray-100 placeholder-slate-400 resize-y"
  />
);

const SelectInput: React.FC<{id: string; value: string; onChange: (val: any) => void; options: {value: string; label: string}[]}> = ({id, value, onChange, options}) => (
    <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as any)}
        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-gray-100"
    >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
);

const SliderInput: React.FC<{id: string; label: string; value: number; onChange: (val: number) => void; min?: number; max?: number; step?: number}> = ({ id, label, value, onChange, min=0, max=100, step=1}) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={id} className="text-sm text-slate-300">{label}</label>
            <span className="text-sm font-medium text-pink-400">{value}</span>
        </div>
        <input
            type="range"
            id={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
    </div>
);

export const DAgentProfileForm: React.FC<DAgentProfileFormProps> = ({
  profile,
  onProfileChange,
  onToneChange,
  onSave,
  isSaving,
  error,
}) => {
  const handleListInputChange = (field: keyof DAgentProfile, value: string) => {
    const arrValue = value.split(',').map(s => s.trim()).filter(s => s !== '');
    onProfileChange(field, arrValue as any); // Cast needed due to string[] type
  };
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="flex items-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
        <SparklesIcon className="w-8 h-8 mr-3 text-pink-500" />
        Configure Your Personal CYRAiNO
      </h2>

      {error && (
        <div className="mb-6 p-3 bg-red-800/30 border border-red-600 text-red-200 rounded-md">
          <p><strong className="font-semibold">Error:</strong> {error}</p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <FormRow label="Your CYRAiNO's Name" htmlFor="agentName">
          <TextInput
            id="agentName"
            value={profile.agentName}
            onChange={(val) => onProfileChange('agentName', val)}
            placeholder="e.g., My Dating Muse, Pathfinder"
          />
        </FormRow>

        <FormRow label="CYRAiNO's Persona Type" htmlFor="agentPersonaType">
          <SelectInput
            id="agentPersonaType"
            value={profile.agentPersonaType}
            onChange={(val) => onProfileChange('agentPersonaType', val as AgentPersonaType)}
            options={AGENT_PERSONA_TYPE_OPTIONS}
          />
        </FormRow>

        <FormRow label="CYRAiNO's Persona Backstory" htmlFor="personaBackstory" description="A brief story or description for your personal AI matchmaker's persona.">
          <TextAreaInput
            id="personaBackstory"
            value={profile.personaBackstory}
            onChange={(val) => onProfileChange('personaBackstory', val)}
            rows={4}
            placeholder="Tell a bit about your CYRAiNO's personality or how it represents you..."
          />
        </FormRow>

        <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
                CYRAiNO's Communication Tone
            </label>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <SliderInput 
                    id="toneWarmth"
                    label="Warmth"
                    value={profile.communicationTone.warmth}
                    onChange={(val) => onToneChange('warmth', val)}
                />
                <SliderInput 
                    id="toneHumor"
                    label="Humor"
                    value={profile.communicationTone.humor}
                    onChange={(val) => onToneChange('humor', val)}
                />
                <SliderInput 
                    id="toneDirectness"
                    label="Directness"
                    value={profile.communicationTone.directness}
                    onChange={(val) => onToneChange('directness', val)}
                />
            </div>
        </div>
        
        <FormRow label="Your Core Values (for your CYRAiNO to champion)" htmlFor="coreValues" description="Comma-separated (e.g., Honesty, Adventure, Empathy)">
          <TextAreaInput
            id="coreValues"
            value={profile.coreValues.join(', ')}
            onChange={(val) => handleListInputChange('coreValues', val)}
            placeholder="Authenticity, Growth, Kindness..."
          />
        </FormRow>

        <FormRow label="Your Hobbies & Interests (for your CYRAiNO to share)" htmlFor="hobbiesInterests" description="Comma-separated (e.g., Hiking, Coding, Jazz Music)">
          <TextAreaInput
            id="hobbiesInterests"
            value={profile.hobbiesInterests.join(', ')}
            onChange={(val) => handleListInputChange('hobbiesInterests', val)}
            placeholder="Indie Music, Photography, Cooking..."
          />
        </FormRow>

        <FormRow label="Your Relationship Goals (for your CYRAiNO to pursue)" htmlFor="relationshipGoal">
          <SelectInput
            id="relationshipGoal"
            value={profile.relationshipGoal}
            onChange={(val) => onProfileChange('relationshipGoal', val as RelationshipGoal)}
            options={RELATIONSHIP_GOAL_OPTIONS}
          />
        </FormRow>

        <FormRow label="Your Dealbreakers (for your CYRAiNO to screen for)" htmlFor="dealbreakers" description="Comma-separated things you're not looking for.">
          <TextAreaInput
            id="dealbreakers"
            value={profile.dealbreakers.join(', ')}
            onChange={(val) => handleListInputChange('dealbreakers', val)}
            placeholder="e.g., Smoker, Poor communication"
          />
        </FormRow>

        <div className="mt-10 text-center">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <RobotIcon className="w-6 h-6 mr-2" />
            {isSaving ? 'Saving Your CYRAiNO...' : 'Save Your CYRAiNO Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};