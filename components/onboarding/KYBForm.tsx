import React, { useState } from 'react';
import { KYBData, LegalForm, Country, IdType } from '../../types/onboarding';
import FileUpload from './FileUpload';
import Button from '../wallet/shared/Button';

interface KYBFormProps {
  data: Partial<KYBData>;
  onChange: (data: Partial<KYBData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  errors?: Record<string, string>;
}

const KYBForm: React.FC<KYBFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  errors = {}
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState<'company' | 'representative' | 'ownership' | 'documents'>('company');

  const handleSectionChange = (field: string, value: any, section: keyof KYBData) => {
    const updatedData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    };
    onChange(updatedData);
    
    // Clear validation error when user starts typing
    const errorKey = `${section}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleShareholderChange = (index: number, field: string, value: any) => {
    const shareholders = [...(data.ownership?.shareholders || [])];
    if (!shareholders[index]) {
      shareholders[index] = { name: '', type: 'Individual', percent: 0 };
    }
    shareholders[index] = { ...shareholders[index], [field]: value };
    
    const updatedData = {
      ...data,
      ownership: {
        ...data.ownership,
        shareholders
      }
    };
    onChange(updatedData);
  };

  const handleUBOChange = (index: number, field: string, value: any) => {
    const ubos = [...(data.ownership?.ubos || [])];
    if (!ubos[index]) {
      ubos[index] = { name: '', percent: 0, country: 'CO' };
    }
    ubos[index] = { ...ubos[index], [field]: value };
    
    const updatedData = {
      ...data,
      ownership: {
        ...data.ownership,
        ubos
      }
    };
    onChange(updatedData);
  };

  const addShareholder = () => {
    const shareholders = [...(data.ownership?.shareholders || []), { name: '', type: 'Individual' as const, percent: 0 }];
    const updatedData = {
      ...data,
      ownership: {
        ...data.ownership,
        shareholders
      }
    };
    onChange(updatedData);
  };

  const addUBO = () => {
    const ubos = [...(data.ownership?.ubos || []), { name: '', percent: 0, country: 'CO' as Country }];
    const updatedData = {
      ...data,
      ownership: {
        ...data.ownership,
        ubos
      }
    };
    onChange(updatedData);
  };

  const removeShareholder = (index: number) => {
    const shareholders = data.ownership?.shareholders?.filter((_, i) => i !== index) || [];
    const updatedData = {
      ...data,
      ownership: {
        ...data.ownership,
        shareholders
      }
    };
    onChange(updatedData);
  };

  const removeUBO = (index: number) => {
    const ubos = data.ownership?.ubos?.filter((_, i) => i !== index) || [];
    const updatedData = {
      ...data,
      ownership: {
        ...data.ownership,
        ubos
      }
    };
    onChange(updatedData);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Company validation
    const requiredCompanyFields = [
      'legal_name', 'legal_form', 'registration_number', 'tax_id', 
      'incorporation_date', 'country', 'city', 'address_line1'
    ];
    requiredCompanyFields.forEach(field => {
      if (!data.company?.[field as keyof typeof data.company]) {
        newErrors[`company.${field}`] = 'Este campo es requerido';
      }
    });

    if (!data.company?.proof_of_address) {
      newErrors['company.proof_of_address'] = 'Comprobante de domicilio es requerido';
    }

    // Representative validation
    const requiredRepFields = [
      'rep_full_name', 'rep_role', 'rep_id_type', 'rep_id_number', 
      'rep_dob', 'rep_nationality', 'rep_email', 'rep_phone'
    ];
    requiredRepFields.forEach(field => {
      if (!data.representative?.[field as keyof typeof data.representative]) {
        newErrors[`representative.${field}`] = 'Este campo es requerido';
      }
    });

    if (data.representative?.rep_is_pep === undefined) {
      newErrors['representative.rep_is_pep'] = 'Estado PEP es requerido';
    }

    if (!data.representative?.rep_id_document) {
      newErrors['representative.rep_id_document'] = 'Documento de identidad es requerido';
    }

    if (!data.representative?.rep_proof_of_address) {
      newErrors['representative.rep_proof_of_address'] = 'Comprobante de domicilio del representante es requerido';
    }

    // Ownership validation
    if (!data.ownership?.shareholders || data.ownership.shareholders.length === 0) {
      newErrors['ownership.shareholders'] = 'Debe agregar al menos un accionista';
    }

    if (!data.ownership?.ubos || data.ownership.ubos.length === 0) {
      newErrors['ownership.ubos'] = 'Debe agregar al menos un beneficiario final';
    }

    // Documents validation
    const requiredDocuments = [
      'fs_income_statement_pdf', 'fs_balance_sheet_pdf', 'bank_statements',
      'tax_return_last_fy', 'kyb_incorp_cert', 'kyb_bylaws',
      'kyb_shareholder_register', 'kyb_board_resolution'
    ];
    requiredDocuments.forEach(field => {
      if (!data.documents?.[field as keyof typeof data.documents]) {
        newErrors[`documents.${field}`] = 'Este documento es requerido';
      }
    });

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    } else {
      // Scroll to first error section
      const firstErrorSection = Object.keys(validationErrors)[0]?.split('.')[0];
      if (firstErrorSection) {
        setCurrentSection(firstErrorSection as any);
      }
    }
  };

  const displayErrors = { ...errors, ...validationErrors };

  const sections = [
    { key: 'company', title: 'Empresa', icon: '🏢' },
    { key: 'representative', title: 'Representante', icon: '👤' },
    { key: 'ownership', title: 'Estructura Accionaria', icon: '📊' },
    { key: 'documents', title: 'Documentos', icon: '📄' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Verificación KYB
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Conoce a tu empresa (KYB) - Verificación empresarial con Sumsub
        </p>
      </div>

      {/* Section Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setCurrentSection(section.key as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentSection === section.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-8">
        {/* Company Section */}
        {currentSection === 'company' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              🏢 Información de la Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Legal de la Entidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.company?.legal_name || ''}
                  onChange={(e) => handleSectionChange('legal_name', e.target.value, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.legal_name'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="Echosystem Technologies SAS"
                />
                {displayErrors['company.legal_name'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.legal_name']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Forma Legal <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.company?.legal_form || ''}
                  onChange={(e) => handleSectionChange('legal_form', e.target.value as LegalForm, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.legal_form'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                >
                  <option value="">Seleccione...</option>
                  <option value="SAS">SAS</option>
                  <option value="LLC">LLC</option>
                  <option value="C-Corp">C-Corp</option>
                  <option value="S-Corp">S-Corp</option>
                  <option value="GmbH">GmbH</option>
                  <option value="Ltd">Ltd</option>
                  <option value="PLC">PLC</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                </select>
                {displayErrors['company.legal_form'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.legal_form']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Registro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.company?.registration_number || ''}
                  onChange={(e) => handleSectionChange('registration_number', e.target.value, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.registration_number'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="901797152-1"
                />
                {displayErrors['company.registration_number'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.registration_number']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NIT / Tax ID / EIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.company?.tax_id || ''}
                  onChange={(e) => handleSectionChange('tax_id', e.target.value, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.tax_id'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="NIT 901797152-1"
                />
                {displayErrors['company.tax_id'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.tax_id']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Constitución <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.company?.incorporation_date || ''}
                  onChange={(e) => handleSectionChange('incorporation_date', e.target.value, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.incorporation_date'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                />
                {displayErrors['company.incorporation_date'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.incorporation_date']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={data.company?.website || ''}
                  onChange={(e) => handleSectionChange('website', e.target.value, 'company')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://echotechnology.xyz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código ISIC (Industria)
                </label>
                <input
                  type="text"
                  value={data.company?.industry_code || ''}
                  onChange={(e) => handleSectionChange('industry_code', e.target.value, 'company')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="541211"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.company?.country || ''}
                  onChange={(e) => handleSectionChange('country', e.target.value as Country, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.country'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                >
                  <option value="">Seleccione...</option>
                  <option value="US">Estados Unidos</option>
                  <option value="CO">Colombia</option>
                  <option value="MX">México</option>
                  <option value="BR">Brasil</option>
                  <option value="CL">Chile</option>
                  <option value="GB">Reino Unido</option>
                  <option value="SG">Singapur</option>
                  <option value="HK">Hong Kong</option>
                  <option value="DE">Alemania</option>
                  <option value="FR">Francia</option>
                  <option value="ES">España</option>
                </select>
                {displayErrors['company.country'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.country']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado / Provincia
                </label>
                <input
                  type="text"
                  value={data.company?.state_province || ''}
                  onChange={(e) => handleSectionChange('state_province', e.target.value, 'company')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Valle del Cauca"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.company?.city || ''}
                  onChange={(e) => handleSectionChange('city', e.target.value, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.city'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="Cali"
                />
                {displayErrors['company.city'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección Línea 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.company?.address_line1 || ''}
                  onChange={(e) => handleSectionChange('address_line1', e.target.value, 'company')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['company.address_line1'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="Zona América Tower 1, Oficina 401"
                />
                {displayErrors['company.address_line1'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['company.address_line1']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección Línea 2
                </label>
                <input
                  type="text"
                  value={data.company?.address_line2 || ''}
                  onChange={(e) => handleSectionChange('address_line2', e.target.value, 'company')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Parque Industrial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={data.company?.postal_code || ''}
                  onChange={(e) => handleSectionChange('postal_code', e.target.value, 'company')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="760032"
                />
              </div>
            </div>

            <div className="mt-6">
              <FileUpload
                label="Comprobante de Domicilio"
                name="proof_of_address"
                required={true}
                accept=".pdf,.jpg,.jpeg,.png"
                value={data.company?.proof_of_address}
                onChange={(file) => handleSectionChange('proof_of_address', file as File, 'company')}
                description="Factura de servicios públicos o extracto bancario ≤ 3 meses"
                error={displayErrors['company.proof_of_address']}
              />
            </div>
          </div>
        )}

        {/* Representative Section */}
        {currentSection === 'representative' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              👤 Representante Legal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.representative?.rep_full_name || ''}
                  onChange={(e) => handleSectionChange('rep_full_name', e.target.value, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_full_name'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="William Martinez"
                />
                {displayErrors['representative.rep_full_name'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_full_name']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cargo / Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.representative?.rep_role || ''}
                  onChange={(e) => handleSectionChange('rep_role', e.target.value, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_role'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="CEO"
                />
                {displayErrors['representative.rep_role'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_role']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de ID <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.representative?.rep_id_type || ''}
                  onChange={(e) => handleSectionChange('rep_id_type', e.target.value as IdType, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_id_type'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                >
                  <option value="">Seleccione...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="DNI">DNI</option>
                  <option value="Passport">Pasaporte</option>
                  <option value="SSN">SSN</option>
                  <option value="Other">Otro</option>
                </select>
                {displayErrors['representative.rep_id_type'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_id_type']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.representative?.rep_id_number || ''}
                  onChange={(e) => handleSectionChange('rep_id_number', e.target.value, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_id_number'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="1234567890"
                />
                {displayErrors['representative.rep_id_number'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_id_number']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.representative?.rep_dob || ''}
                  onChange={(e) => handleSectionChange('rep_dob', e.target.value, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_dob'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                />
                {displayErrors['representative.rep_dob'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_dob']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nacionalidad <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.representative?.rep_nationality || ''}
                  onChange={(e) => handleSectionChange('rep_nationality', e.target.value as Country, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_nationality'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                >
                  <option value="">Seleccione...</option>
                  <option value="US">Estados Unidos</option>
                  <option value="CO">Colombia</option>
                  <option value="MX">México</option>
                  <option value="BR">Brasil</option>
                  <option value="CL">Chile</option>
                  <option value="GB">Reino Unido</option>
                  <option value="SG">Singapur</option>
                  <option value="HK">Hong Kong</option>
                  <option value="DE">Alemania</option>
                  <option value="FR">Francia</option>
                  <option value="ES">España</option>
                </select>
                {displayErrors['representative.rep_nationality'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_nationality']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={data.representative?.rep_email || ''}
                  onChange={(e) => handleSectionChange('rep_email', e.target.value, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_email'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="wmb81321@gmail.com"
                />
                {displayErrors['representative.rep_email'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_email']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={data.representative?.rep_phone || ''}
                  onChange={(e) => handleSectionChange('rep_phone', e.target.value, 'representative')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['representative.rep_phone'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="+1301501248"
                />
                {displayErrors['representative.rep_phone'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_phone']}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado PEP <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rep_is_pep"
                      value="false"
                      checked={data.representative?.rep_is_pep === false}
                      onChange={() => handleSectionChange('rep_is_pep', false, 'representative')}
                      className="mr-2"
                    />
                    No es una Persona Políticamente Expuesta
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rep_is_pep"
                      value="true"
                      checked={data.representative?.rep_is_pep === true}
                      onChange={() => handleSectionChange('rep_is_pep', true, 'representative')}
                      className="mr-2"
                    />
                    Es una Persona Políticamente Expuesta
                  </label>
                </div>
                {displayErrors['representative.rep_is_pep'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['representative.rep_is_pep']}</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <FileUpload
                label="Documento de Identidad"
                name="rep_id_document"
                required={true}
                accept=".pdf,.jpg,.jpeg,.png"
                value={data.representative?.rep_id_document}
                onChange={(file) => handleSectionChange('rep_id_document', file as File, 'representative')}
                description="PDF/JPG/PNG del documento de identidad"
                error={displayErrors['representative.rep_id_document']}
              />

              <FileUpload
                label="Comprobante de Domicilio del Representante"
                name="rep_proof_of_address"
                required={true}
                accept=".pdf,.jpg,.jpeg,.png"
                value={data.representative?.rep_proof_of_address}
                onChange={(file) => handleSectionChange('rep_proof_of_address', file as File, 'representative')}
                description="Factura de servicios públicos o extracto bancario ≤ 3 meses"
                error={displayErrors['representative.rep_proof_of_address']}
              />

              <FileUpload
                label="Poder de Representación (PoA)"
                name="rep_authority_document"
                required={false}
                accept=".pdf,.jpg,.jpeg,.png"
                value={data.representative?.rep_authority_document}
                onChange={(file) => handleSectionChange('rep_authority_document', file as File, 'representative')}
                description="Resolución de junta directiva o poder notarial (opcional)"
              />
            </div>
          </div>
        )}

        {/* Ownership Section */}
        {currentSection === 'ownership' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📊 Estructura Accionaria
            </h3>
            
            {/* Shareholders */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Accionistas (>10%)
                </h4>
                <Button onClick={addShareholder} variant="outline" size="small">
                  + Agregar Accionista
                </Button>
              </div>
              
              {data.ownership?.shareholders?.map((shareholder, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      Accionista #{index + 1}
                    </h5>
                    <button
                      onClick={() => removeShareholder(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={shareholder.name}
                        onChange={(e) => handleShareholderChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Alice Smith"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo
                      </label>
                      <select
                        value={shareholder.type}
                        onChange={(e) => handleShareholderChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Individual">Individual</option>
                        <option value="Corporate">Corporativo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Porcentaje (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={shareholder.percent}
                        onChange={(e) => handleShareholderChange(index, 'percent', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="20"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {displayErrors['ownership.shareholders'] && (
                <p className="text-sm text-red-600">{displayErrors['ownership.shareholders']}</p>
              )}
            </div>

            {/* UBOs */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Beneficiarios Finales (UBOs)
                </h4>
                <Button onClick={addUBO} variant="outline" size="small">
                  + Agregar UBO
                </Button>
              </div>
              
              {data.ownership?.ubos?.map((ubo, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      UBO #{index + 1}
                    </h5>
                    <button
                      onClick={() => removeUBO(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={ubo.name}
                        onChange={(e) => handleUBOChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Bob Johnson"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Porcentaje (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={ubo.percent}
                        onChange={(e) => handleUBOChange(index, 'percent', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        País
                      </label>
                      <select
                        value={ubo.country}
                        onChange={(e) => handleUBOChange(index, 'country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="US">Estados Unidos</option>
                        <option value="CO">Colombia</option>
                        <option value="MX">México</option>
                        <option value="BR">Brasil</option>
                        <option value="CL">Chile</option>
                        <option value="GB">Reino Unido</option>
                        <option value="SG">Singapur</option>
                        <option value="HK">Hong Kong</option>
                        <option value="DE">Alemania</option>
                        <option value="FR">Francia</option>
                        <option value="ES">España</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              {displayErrors['ownership.ubos'] && (
                <p className="text-sm text-red-600">{displayErrors['ownership.ubos']}</p>
              )}
            </div>

            <FileUpload
              label="Registro de Accionistas / Tabla de Capitalización"
              name="cap_table_document"
              required={false}
              accept=".pdf,.xlsx,.csv"
              value={data.ownership?.cap_table_document}
              onChange={(file) => handleSectionChange('cap_table_document', file as File, 'ownership')}
              description="Último registro de accionistas (opcional)"
            />
          </div>
        )}

        {/* Documents Section */}
        {currentSection === 'documents' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📄 Documentos Requeridos
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Estado de Resultados (PDF)"
                  name="fs_income_statement_pdf"
                  required={true}
                  accept=".pdf"
                  value={data.documents?.fs_income_statement_pdf}
                  onChange={(file) => handleSectionChange('fs_income_statement_pdf', file as File, 'documents')}
                  description="Estado financiero oficial"
                  error={displayErrors['documents.fs_income_statement_pdf']}
                />

                <FileUpload
                  label="Balance General (PDF)"
                  name="fs_balance_sheet_pdf"
                  required={true}
                  accept=".pdf"
                  value={data.documents?.fs_balance_sheet_pdf}
                  onChange={(file) => handleSectionChange('fs_balance_sheet_pdf', file as File, 'documents')}
                  description="Balance oficial"
                  error={displayErrors['documents.fs_balance_sheet_pdf']}
                />

                <FileUpload
                  label="Extractos Bancarios (3-6 meses)"
                  name="bank_statements"
                  required={true}
                  accept=".pdf,.csv"
                  value={data.documents?.bank_statements}
                  onChange={(file) => handleSectionChange('bank_statements', file as File, 'documents')}
                  description="Proporcionar PDFs o CSVs"
                  error={displayErrors['documents.bank_statements']}
                />

                <FileUpload
                  label="Declaración de Renta (último año fiscal)"
                  name="tax_return_last_fy"
                  required={true}
                  accept=".pdf"
                  value={data.documents?.tax_return_last_fy}
                  onChange={(file) => handleSectionChange('tax_return_last_fy', file as File, 'documents')}
                  description="Declaración presentada"
                  error={displayErrors['documents.tax_return_last_fy']}
                />

                <FileUpload
                  label="Certificado de Constitución"
                  name="kyb_incorp_cert"
                  required={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  value={data.documents?.kyb_incorp_cert}
                  onChange={(file) => handleSectionChange('kyb_incorp_cert', file as File, 'documents')}
                  description="Certificado oficial de constitución"
                  error={displayErrors['documents.kyb_incorp_cert']}
                />

                <FileUpload
                  label="Estatutos / Bylaws"
                  name="kyb_bylaws"
                  required={true}
                  accept=".pdf"
                  value={data.documents?.kyb_bylaws}
                  onChange={(file) => handleSectionChange('kyb_bylaws', file as File, 'documents')}
                  description="Documentos constitutivos de la entidad"
                  error={displayErrors['documents.kyb_bylaws']}
                />

                <FileUpload
                  label="Registro de Accionistas"
                  name="kyb_shareholder_register"
                  required={true}
                  accept=".pdf,.xlsx"
                  value={data.documents?.kyb_shareholder_register}
                  onChange={(file) => handleSectionChange('kyb_shareholder_register', file as File, 'documents')}
                  description="Registro actual de accionistas"
                  error={displayErrors['documents.kyb_shareholder_register']}
                />

                <FileUpload
                  label="Resolución de Junta / PoA"
                  name="kyb_board_resolution"
                  required={true}
                  accept=".pdf"
                  value={data.documents?.kyb_board_resolution}
                  onChange={(file) => handleSectionChange('kyb_board_resolution', file as File, 'documents')}
                  description="Autoriza al representante a actuar"
                  error={displayErrors['documents.kyb_board_resolution']}
                />

                <FileUpload
                  label="Certificado de Identificación Fiscal"
                  name="kyb_tax_certificate"
                  required={false}
                  accept=".pdf"
                  value={data.documents?.kyb_tax_certificate}
                  onChange={(file) => handleSectionChange('kyb_tax_certificate', file as File, 'documents')}
                  description="Certificado oficial de ID fiscal (opcional)"
                />

                <FileUpload
                  label="Política AML"
                  name="kyb_aml_policy"
                  required={false}
                  accept=".pdf"
                  value={data.documents?.kyb_aml_policy}
                  onChange={(file) => handleSectionChange('kyb_aml_policy', file as File, 'documents')}
                  description="Requerido si es entidad regulada (opcional)"
                />

                <FileUpload
                  label="Formulario de Residencia Fiscal"
                  name="kyb_tax_form"
                  required={false}
                  accept=".pdf"
                  value={data.documents?.kyb_tax_form}
                  onChange={(file) => handleSectionChange('kyb_tax_form', file as File, 'documents')}
                  description="W-8BEN, W-9, CRS (opcional)"
                />

                <FileUpload
                  label="Evidencia de Fuente de Fondos"
                  name="so_funds_evidence"
                  required={false}
                  accept=".pdf"
                  value={data.documents?.so_funds_evidence}
                  onChange={(file) => handleSectionChange('so_funds_evidence', file as File, 'documents')}
                  description="Carta bancaria, estados financieros, carta del auditor (opcional)"
                />
              </div>
            </div>
          </div>
        )}

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
          <span className="text-gray-600 dark:text-gray-400">Paso 2 de 6</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Verificación KYB
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '33.33%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default KYBForm;
