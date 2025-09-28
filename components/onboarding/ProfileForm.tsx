import React, { useState } from 'react';
import { UserProfile } from '../../types/onboarding';
import FileUpload from './FileUpload';
import Button from '../wallet/shared/Button';

interface ProfileFormProps {
  data: Partial<UserProfile>;
  onChange: (data: Partial<UserProfile>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  errors?: Record<string, string>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  errors = {}
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof UserProfile, value: string | File) => {
    onChange({
      ...data,
      [field]: value
    });
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!data.admin_user?.trim()) {
      newErrors.admin_user = 'Nombre del administrador es requerido';
    }

    if (!data.primary_email?.trim()) {
      newErrors.primary_email = 'Email principal es requerido';
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.primary_email)) {
        newErrors.primary_email = 'Formato de email inválido';
      }
    }

    if (!data.primary_phone?.trim()) {
      newErrors.primary_phone = 'Teléfono principal es requerido';
    } else {
      // Phone format validation (E.164)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(data.primary_phone)) {
        newErrors.primary_phone = 'Formato de teléfono inválido (debe incluir código de país, ej: +573152812505)';
      }
    }

    if (!data.brand_logo) {
      newErrors.brand_logo = 'Logo de la empresa es requerido';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const displayErrors = { ...errors, ...validationErrors };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Perfil de Usuario
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Información básica de contacto y branding de tu empresa
        </p>
      </div>

      <form className="space-y-6">
        {/* Admin User Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del Administrador
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={data.admin_user || ''}
            onChange={(e) => handleInputChange('admin_user', e.target.value)}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${displayErrors.admin_user 
                ? 'border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
              }
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            `}
            placeholder="Nombre completo del administrador"
          />
          {displayErrors.admin_user && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {displayErrors.admin_user}
            </p>
          )}
        </div>

        {/* Primary Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Principal
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            value={data.primary_email || ''}
            onChange={(e) => handleInputChange('primary_email', e.target.value)}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${displayErrors.primary_email 
                ? 'border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
              }
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            `}
            placeholder="ops@convexo.xyz"
          />
          {displayErrors.primary_email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {displayErrors.primary_email}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Este será el contacto principal para el proceso de onboarding
          </p>
        </div>

        {/* Primary Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Teléfono Principal
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="tel"
            value={data.primary_phone || ''}
            onChange={(e) => handleInputChange('primary_phone', e.target.value)}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${displayErrors.primary_phone 
                ? 'border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
              }
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            `}
            placeholder="+573152812505"
          />
          {displayErrors.primary_phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {displayErrors.primary_phone}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Formato E.164 (incluir código de país)
          </p>
        </div>

        {/* Brand Logo Upload */}
        <FileUpload
          label="Logo de la Empresa"
          name="brand_logo"
          required={true}
          accept=".png,.jpg,.jpeg,.svg"
          value={data.brand_logo}
          onChange={(file) => handleInputChange('brand_logo', file as File)}
          description="Logo oficial de tu empresa para usar en documentos y reportes"
          maxSize={5}
          error={displayErrors.brand_logo}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          {onPrevious && (
            <Button
              onClick={onPrevious}
              variant="outline"
              className="px-6"
            >
              Anterior
            </Button>
          )}
          <div className="flex-1"></div>
          <Button
            onClick={handleNext}
            variant="primary"
            className="px-6"
          >
            Continuar
          </Button>
        </div>
      </form>

      {/* Progress Indicator */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Paso 1 de 6</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Información de Contacto
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '16.67%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
