
import React, { useState } from 'react';
import { Camera, DollarSign, Calendar, UploadCloud, ChevronLeft, Lightbulb, X } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { ItemCategory, Profile } from '../types';
import { itemTable } from '../lib/db';

interface CreateItemScreenProps {
  userProfile: Profile;
  onSuccess: () => void;
}

const CreateItemScreen: React.FC<CreateItemScreenProps> = ({ userProfile, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPhotoTip, setShowPhotoTip] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ItemCategory.OTHER,
    dailyPrice: '',
    replacementValue: '',
    minRentDays: '1',
    imageUrl: '' // In real app, this would be handled by file upload
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageInteraction = () => {
    if (!formData.imageUrl && !showPhotoTip) {
      setShowPhotoTip(true);
      // Auto dismiss after 6 seconds
      setTimeout(() => setShowPhotoTip(false), 6000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate network
      await new Promise(r => setTimeout(r, 1000));

      itemTable.create({
        ownerId: userProfile.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dailyPrice: Number(formData.dailyPrice),
        replacementValue: Number(formData.replacementValue),
        minRentDays: Number(formData.minRentDays),
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=1000'], // Fallback image
        locationLat: 0, // Mock location
        locationLng: 0
      });

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Anuncie seu Gear</h1>
        <p className="text-gray-400 text-sm">Comece a ganhar com seus equipamentos parados.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Image Upload Mock */}
        <div 
          onClick={handleImageInteraction}
          className="border-2 border-dashed border-gray-700 rounded-2xl h-48 flex flex-col items-center justify-center bg-surface hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden"
        >
          {formData.imageUrl ? (
             <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : null}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <Camera className="text-primary" />
            </div>
            <p className="text-sm font-medium text-white">Toque para enviar fotos</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
          </div>
        </div>

        {/* SMART POP-UP (TOAST) */}
        {showPhotoTip && (
          <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl flex items-start gap-3 animate-fade-in shadow-lg">
            <div className="bg-blue-500/20 p-1.5 rounded-full shrink-0">
              <Lightbulb size={16} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-200 leading-snug">
                <span className="font-bold text-white">Dica de Mestre:</span> Fotos claras e bem iluminadas aumentam suas chances de alugar em <span className="text-green-400 font-bold">40%</span>.
              </p>
            </div>
            <button type="button" onClick={() => setShowPhotoTip(false)} className="text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Temporary URL Input for MVP */}
        <Input
          label="URL da Imagem (Para Demo)"
          name="imageUrl"
          placeholder="https://..."
          value={formData.imageUrl}
          onChange={handleChange}
          onFocus={handleImageInteraction}
        />

        <Input
          label="Título"
          name="title"
          placeholder="Ex: Sony A7 III Body"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-400 ml-1">Categoria</label>
          <select
            name="category"
            className="w-full bg-surface text-white rounded-xl border border-gray-800 px-4 py-3 outline-none focus:border-primary appearance-none"
            value={formData.category}
            onChange={handleChange}
          >
            {Object.values(ItemCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-400 ml-1">Descrição</label>
          <textarea
            name="description"
            rows={4}
            className="w-full bg-surface text-white rounded-xl border border-gray-800 px-4 py-3 outline-none focus:border-primary placeholder:text-gray-600 resize-none"
            placeholder="Descreva a condição, acessórios inclusos..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valor Diária (R$)"
            name="dailyPrice"
            type="number"
            placeholder="0.00"
            icon={<DollarSign size={14} />}
            value={formData.dailyPrice}
            onChange={handleChange}
            required
          />
          <Input
            label="Valor de Reposição (R$)"
            name="replacementValue"
            type="number"
            placeholder="0.00"
            icon={<DollarSign size={14} />}
            value={formData.replacementValue}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Mínimo de Dias"
          name="minRentDays"
          type="number"
          placeholder="1"
          icon={<Calendar size={14} />}
          value={formData.minRentDays}
          onChange={handleChange}
          required
        />

        <div className="pt-4">
           <Button type="submit" fullWidth isLoading={loading}>
             Publicar Anúncio
           </Button>
        </div>

      </form>
    </div>
  );
};

export default CreateItemScreen;
