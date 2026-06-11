import { CheckCircle, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
];

const ApplyModel = ({ isOpen, onClose, projectTitle, projectId, studentId, token }) => {

    const [currentStep, setCurrentStep] = useState(1);
    const [cvFile, setCvFile] = useState(null);
    const [planFile, setPlanFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [cvDragging, setCvDragging] = useState(false);
    const [planDragging, setPlanDragging] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const cvInputRef = useRef(null);
    const planInputRef = useRef(null);

    if (!isOpen) return null;

    const resetForm = () => {
        setCurrentStep(1);
        setCvFile(null);
        setPlanFile(null);
        setNotes('');
        setCvDragging(false);
        setPlanDragging(false);
        setSubmitted(false);
        setLoading(false);
    };

    const validateFiles = (file) => {
        if (!file) return 'File is required.';

        if (file.size > MAX_FILE_SIZE) {
            return 'File size exceeds the limit of 5MB.';
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Invalid file type. Please upload a PDF or DOCX file.';
        }

        return null;
    };

    const handleValidatedFileSet = (file, type) => {
        const error = validateFiles(file);

        if (error) {
            toast.error(error, { duration: 4000 });
            return;
        }

        type === 'cv' ? setCvFile(file) : setPlanFile(file);

    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) {
            toast.error('No file selected.', { duration: 4000 });
            return;
        }
        handleValidatedFileSet(file, type);
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleValidatedFileSet(file, type);
        type === 'cv' ? setCvDragging(false) : setPlanDragging(false);
    };

    const handleNext = () => {
        if (currentStep === 1 && !cvFile) {
            toast.error('Please upload your CV/Resume before proceeding.', { duration: 4000 });
            return;
        }

        if (currentStep === 2 && !planFile) {
            toast.error('Please upload your Project Plan before proceeding.', { duration: 4000 });
            return;
        }
        setCurrentStep((prev) => prev + 1);
    }

    const handleSubmit = async () => {

        if (!studentId) {
            toast.error('Student ID is required.', { duration: 4000 });
            return;
        }
        if (!projectId) {
            toast.error('Project ID is required.', { duration: 4000 });
            return;
        }
        if (!cvFile) {
            toast.error('CV/Resume file is required.', { duration: 4000 });
            setCurrentStep(1);
            return;
        }
        if (!planFile) {
            toast.error('Project Plan file is required.', { duration: 4000 });
            setCurrentStep(2);
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('studentId', studentId);
            formData.append('projectId', projectId);
            formData.append('status', 'applied');
            formData.append('cvFile', cvFile);
            formData.append('planFile', planFile);
            formData.append('notes', notes);

            const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/apply-project`, {
                method: 'POST',     
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                toast.error(result.message || 'Failed to submit application');
                return;
            }

            setSubmitted(true);
            toast.success(result.message || 'Application submitted successfully!');

            setTimeout(() => {
                resetForm();
                onClose();
            }, 2000);


        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('An error occurred while submitting the application.');
        } finally {
            setLoading(false);
        }

    };

    const steps = [
        { number: 1, label: 'Upload CV' },
        { number: 2, label: 'Project Plan' },
        { number: 3, label: 'Submit' },
    ]

    const FileUploadBox = ({ file, setFile, dragging, setDragging, inputRef, type }) => (
        <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => handleDrop(e, type)}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${dragging
                ? 'border-blue-500 bg-blue-50'
                : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleFileChange(e, type)}
            />
            {file ? (
                <>
                    <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                    <p className="text-green-600 font-medium text-sm">{file.name}</p>
                    <p className="text-gray-400 text-xs mt-1">Click to replace</p>
                </>
            ) : (
                <>
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-gray-400 text-sm mt-1">.pdf, .docx (max 10MB)</p>
                </>
            )}
        </div>
    );

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4'>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden'>
                <div className='flex items-start justify-between p-8 pb-6 border-b border-gray-100'>
                    <div>
                        <h2 className='text-2xl font-bold text-gray-900'>Apply for: {projectTitle}</h2>
                    </div>
                    <button
                        onClick={() => {
                            onClose();
                            resetForm();
                        }}
                        className='text-gray-400 hover:text-gray-600 transition-colors mt-1 cursor-pointer'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='px-8 pt-6 pb-2'>
                    <div className='flex items-center'>
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className='flex flex-col items-center'>
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {step.number}
                                    </div>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className='flex-1 mx-1'>
                                        <div className='h-0.5 bg-gray-200 rounded-full overflow-hidden'>
                                            <div
                                                className='h-full bg-primary transition-all duration-500'
                                                style={{ width: currentStep > step.number ? '100%' : '0%' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className='flex justify-between mt-2'>
                        {steps.map((step) => (
                            <span
                                key={step.number}
                                className={`text-xs transition-colors ${currentStep >= step.number ? 'text-gray-700' : 'text-gray-400'}`}
                                style={{
                                    width: '70px',
                                    textAlign: step.number === 1 ? 'left' : step.number === 2 ? 'center' : 'right'
                                }}
                            >
                                {step.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className='px-8 py-6 min-h-[280px]'>
                    {currentStep === 1 && (
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Upload Your CV/Resume</h3>
                            <FileUploadBox
                                file={cvFile}
                                dragging={cvDragging}
                                setDragging={setCvDragging}
                                inputRef={cvInputRef}
                                type="cv"
                            />
                            <p className="text-gray-400 text-sm mt-3">
                                Upload your latest CV or resume. This will be shared with the project owner.
                            </p>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Upload Project Plan</h3>
                            <FileUploadBox
                                file={planFile}
                                dragging={planDragging}
                                setDragging={setPlanDragging}
                                inputRef={planInputRef}
                                type="plan"
                            />
                            <div className='mt-5'>
                                <h3 className='text-base font-semibold text-gray-900 mb-2'>
                                    Additional Notes <span className='text-gray-400 font-normal'>(Optional)</span>
                                </h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Share your approach, timeline, or any questions..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className='flex flex-col items-center justify-center py-6'>
                            {submitted ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                                    <p className="text-gray-500 text-sm text-center">
                                        The project owner will review your application and get back to you.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Submit?</h3>
                                    <p className="text-gray-500 text-sm text-center max-w-sm">
                                        Your application will be sent to the project owner for review. You'll be notified of any updates.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {!submitted && (
                    <div className="flex justify-end gap-3 px-8 pb-8">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep((s) => s - 1)}
                                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ApplyModel