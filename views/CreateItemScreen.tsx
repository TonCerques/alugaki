
import React, { useState, useEffect } from 'react';
import { Camera, DollarSign, Calendar, UploadCloud, ChevronLeft, Lightbulb, X, Save } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { ItemCategory, Profile, Item } from '../types';
import { itemTable } from '../lib/db';

interface CreateItemScreenProps {
  userProfile: Profile;
  onSuccess: () => void;
  onCancel?: () => void;
  editingItem?: Item | null; // Se fornecido, ativa o modo de edição
}

const CreateItemScreen: React.FC<CreateItemScreenProps> = ({ userProfile, onSuccess, onCancel, editingItem }) => {
  const [loading, setLoading] = useState(false);
  const [showPhotoTip, setShowPhotoTip] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ItemCategory.OTHER,
    dailyPrice: '',
    replacementValue: '',
    minRentDays: '1',
    imageUrl: ''
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        description: editingItem.description,
        category: editingItem.category,
        dailyPrice: editingItem.dailyPrice.toString(),
        replacementValue: editingItem.replacementValue.toString(),
        minRentDays: editingItem.minRentDays.toString(),
        imageUrl: editingItem.images[0] || ''
      });
    }
  }, [editingItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageInteraction = () => {
    if (!formData.imageUrl && !showPhotoTip) {
      setShowPhotoTip(true);
      setTimeout(() => setShowPhotoTip(false), 6000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 1000)); // Simulate network

      const commonData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dailyPrice: Number(formData.dailyPrice),
        replacementValue: Number(formData.replacementValue),
        minRentDays: Number(formData.minRentDays),
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=1000'],
      };

      if (editingItem) {
        // UPDATE MODE
        itemTable.update(editingItem.id, commonData);
      } else {
        // CREATE MODE
        itemTable.create({
          ownerId: userProfile.id,
          ...commonData,
          locationLat: 0,
          locationLng: 0
        });
      }

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 relative h-full bg-background overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        {onCancel && (
          <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {editingItem ? 'Editar Anúncio' : 'Anuncie seu Gear'}
          </h1>
          <p className="text-gray-400 text-sm">
            {editingItem ? 'Atualize as informações do seu produto.' : 'Comece a ganhar com seus equipamentos parados.'}
          </p>
        </div>
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
            <p className="text-sm font-medium text-white">Toque para alterar fotos</p>
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

        <div className="pt-4 pb-8">
           <Button type="submit" fullWidth isLoading={loading}>
             <div className="flex items-center gap-2">
               {editingItem ? <Save size={20} /> : <UploadCloud size={20} />}
               {editingItem ? 'Salvar Alterações' : 'Publicar Anúncio'}
             </div>
           </Button>
           {editingItem && onCancel && (
             <Button type="button" variant="ghost" fullWidth onClick={onCancel} className="mt-2">
               Cancelar
             </Button>
           )}
        </div>

      </form>
    </div>
  );
};

export default CreateItemScreen;
