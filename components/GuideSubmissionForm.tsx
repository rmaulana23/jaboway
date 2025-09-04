
import React, { useState, useEffect } from 'react';
import { t } from '../utils/i18n';
import { Category, Guide } from '../types';
import { CATEGORIES, CITIES } from '../constants';

// FIX: Define form data type more accurately, excluding properties not on the form.
type GuideFormData = Omit<Guide, 'id' | 'status' | 'author_id' | 'created_at' | 'views' | 'profiles'>;

interface GuideSubmissionFormProps {
    initialData?: Guide;
    onSubmit: (formData: GuideFormData) => void;
    onCancel: () => void;
    submitButtonText: string;
    formTitle: string;
}

const GuideSubmissionForm: React.FC<GuideSubmissionFormProps> = ({ initialData, onSubmit, onCancel, submitButtonText, formTitle }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState('');
  const [tips, setTips] = useState('');
  const [category, setCategory] = useState<Category>(Category.Transportasi);
  const [city, setCity] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (initialData) {
        // FIX: Cast string from initialData to Category enum type.
        setCategory(initialData.category as Category);
        setCity(initialData.city);
        setTags(initialData.tags?.join(', ') || '');
        setTitle(initialData.title);
        setSteps(initialData.steps.join('\n'));
        setTips(initialData.tips?.join('\n') || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType(null);
    
    if (!title || !steps || !city) {
        alert("Judul, Langkah-langkah, dan Kota wajib diisi.");
        return;
    }

    const formData: GuideFormData = {
        title,
        category,
        city,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        area: initialData?.area || 'Jabodetabek',
        steps: steps.split('\n').map(step => step.trim()).filter(Boolean),
        tips: tips.split('\n').map(tip => tip.trim()).filter(Boolean),
        // FIX: The 'links' property is now part of the Guide type.
        links: initialData?.links || [],
    };
    
    onSubmit(formData);
    
    const successMsg = initialData ? t('guide_updated_success') : t('submission_success');
    setMessage(successMsg);
    setMessageType('success');
    setTimeout(() => {
        setMessage('');
        setMessageType(null);
        if (!initialData) {
            onCancel(); // Close form only on new submission success
        }
    }, 2000);
  };

  return (
    <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-md border border-[var(--color-border)]">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">{formTitle}</h2>
            <button onClick={onCancel} className="px-3 py-2 text-sm font-medium rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)] transition-colors">{t('back_to_list')}</button>
        </div>
        {!initialData && <p className="text-[var(--color-text-muted)] mb-4">{t('form_description')}</p>}
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-6" role="alert">
          <p className="font-bold">{t('form_privacy_warning')}</p>
        </div>

        {message && (
          <div className={`border-l-4 p-4 my-6 ${messageType === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
             <div>
                <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-primary)]">{t('guide_title')}</label>
                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" placeholder={t('guide_title_placeholder')} />
             </div>
             <div>
                <label htmlFor="steps" className="block text-sm font-medium text-[var(--color-text-primary)]">{t('guide_steps')}</label>
                <textarea id="steps" value={steps} onChange={e => setSteps(e.target.value)} required rows={5} className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" placeholder={t('guide_steps_placeholder')}></textarea>
             </div>
             <div>
                <label htmlFor="tips" className="block text-sm font-medium text-[var(--color-text-primary)]">{t('guide_tips')}</label>
                <textarea id="tips" value={tips} onChange={e => setTips(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" placeholder={t('guide_tips_placeholder')}></textarea>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-[var(--color-text-primary)]">{t('guide_category')}</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-[var(--color-bg)] border-[var(--color-border)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-[var(--color-text-primary)]">{t('guide_city')}</label>
                <select id="city" value={city} onChange={e => setCity(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-[var(--color-bg)] border-[var(--color-border)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md">
                    <option value="" disabled>{t('guide_city_placeholder')}</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-[var(--color-text-primary)]">{t('guide_tags')}</label>
            <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" placeholder={t('guide_tags_placeholder')} />
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]">
              {submitButtonText}
            </button>
          </div>
        </form>
    </div>
  );
};

export default GuideSubmissionForm;