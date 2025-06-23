import React, { useState, useEffect } from 'react';
import {
  Edit,
  Plus,
  Trash,
  Loader2,
  FileText,
  Upload,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import MainLayout from '@/section/MainLayout';
import {
  addQuiz,
  updateQuiz,
  deleteQuiz,
  deleteAllQuizzes,
  deleteQuizzesByFileName,
  getAllQuizzes,
  getQuizzesByFileName,
} from '../apis/quizApis';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as XLSX from 'xlsx';

const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const jsonconfig = { withCredentials: true };

type Quiz = {
  _id: string;
  Question: string;
  Options: string[];
  Course: string;
  CorrectAnswer: string;
  fileName: string;
};

type QuizFile = {
  fileName?: string; // Made optional to handle undefined/null cases
  Course: string;
  count: number;
};

type QuizFormData = {
  Question: string;
  Options: string[];
  Course: string;
  CorrectAnswer: string;
  fileName: string;
};

type ExcelUploadFormData = {
  course: string;
};

type SortField = 'fileName' | 'Course';
type SortOrder = 'asc' | 'desc';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const QuizUpload: React.FC = () => {
  const [quizFiles, setQuizFiles] = useState<QuizFile[]>([]);
  const [filteredQuizFiles, setFilteredQuizFiles] = useState<QuizFile[]>([]);
  const [selectedFileQuizzes, setSelectedFileQuizzes] = useState<Quiz[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isViewQuestionsOpen, setIsViewQuestionsOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedFile, setSelectedFile] = useState<QuizFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState<SortField>('fileName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<QuizFormData>({
    defaultValues: {
      Question: '',
      Options: ['', '', '', ''],
      Course: '',
      CorrectAnswer: '',
      fileName: '',
    },
  });

  const {
    register: registerExcel,
    handleSubmit: handleSubmitExcel,
    formState: { errors: errorsExcel },
    reset: resetExcel,
  } = useForm<ExcelUploadFormData>({
    defaultValues: {
      course: '',
    },
  });

  const fetchQuizFiles = async () => {
    setIsPageLoading(true);
    try {
      const response = await getAllQuizzes();
      if (response?.status === 200) {
        // Filter out invalid quiz files (missing or empty fileName)
        const validQuizFiles = (response.data.data || []).filter(
          (file: QuizFile) => file.fileName && file.fileName.trim() !== ''
        );
        setQuizFiles(validQuizFiles);
        if (validQuizFiles.length === 0 && response.data.data?.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Some quiz files were invalid and filtered out.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Quiz files fetched successfully',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to fetch quiz files',
        });
        setQuizFiles([]);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while fetching quiz files',
      });
      setQuizFiles([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizFiles();
  }, []);

  const uniqueCategories = [...new Set(quizFiles.map((file) => file.Course))].filter(Boolean);

  useEffect(() => {
    let filtered = quizFiles.filter((file) => {
      const matchesSearch =
        searchTerm === '' ||
        (file.fileName &&
          file.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        file.Course.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || file.Course === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredQuizFiles(filtered);

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    setPaginationInfo({
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    });

    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [quizFiles, searchTerm, selectedCategory, sortField, sortOrder, currentPage, itemsPerPage]);

  const getPaginatedQuizFiles = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredQuizFiles.slice(startIndex, endIndex);
  };

  useEffect(() => {
    if (!isAddOpen && !isEditOpen) {
      reset();
    }
  }, [isAddOpen, isEditOpen, reset]);

  useEffect(() => {
    if (selectedQuiz && isEditOpen) {
      setValue('Question', selectedQuiz.Question);
      setValue('Options', selectedQuiz.Options);
      setValue('Course', selectedQuiz.Course);
      setValue('CorrectAnswer', selectedQuiz.CorrectAnswer);
      setValue('fileName', selectedQuiz.fileName);
    }
  }, [selectedQuiz, isEditOpen, setValue]);

  const handleAddQuiz = async (data: QuizFormData) => {
    setIsLoading(true);
    try {
      const response = await addQuiz(data);
      if (response.status === 201) {
        await fetchQuizFiles();
        if (selectedFile) {
          await fetchQuizzesForFile(selectedFile.fileName || '');
        }
        setIsAddOpen(false);
        reset();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message || 'Quiz added successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to add quiz',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding the quiz',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuiz = async (data: QuizFormData) => {
    if (!selectedQuiz) return;

    setIsLoading(true);
    try {
      const response = await updateQuiz(data, selectedQuiz._id);
      if (response.status === 200) {
        await fetchQuizFiles();
        if (selectedFile) {
          await fetchQuizzesForFile(selectedFile.fileName || '');
        }
        setIsEditOpen(false);
        setSelectedQuiz(null);
        reset();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message || 'Quiz updated successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to update quiz',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the quiz',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    setIsLoading(true);
    try {
      const response = await deleteQuiz(selectedQuiz._id);
      if (response.status === 200) {
        await fetchQuizFiles();
        if (selectedFile) {
          await fetchQuizzesForFile(selectedFile.fileName || '');
        }
        setIsDeleteOpen(false);
        setSelectedQuiz(null);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message || 'Quiz deleted successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to delete quiz',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while deleting the quiz',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllQuizzes = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete All Quizzes',
      text: 'This will permanently delete all quizzes. This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete All',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await deleteAllQuizzes();
        if (response.status === 200) {
          await fetchQuizFiles();
          setSelectedFileQuizzes([]);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.data.message || 'All quizzes deleted successfully!',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.data?.message || 'Failed to delete quizzes',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting quizzes',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteQuizzesByFileName = async (file: QuizFile) => {
    if (!file.fileName) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Cannot delete quizzes: File name is missing.',
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Quiz File',
      text: `This will permanently delete all quizzes in ${file.fileName}. This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: 'Delete File',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await deleteQuizzesByFileName(file.fileName);
        if (response.status === 200) {
          await fetchQuizFiles();
          if (selectedFile?.fileName === file.fileName) {
            setSelectedFile(null);
            setSelectedFileQuizzes([]);
            setIsViewQuestionsOpen(false);
          }
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.data.message || `Quizzes for ${file.fileName} deleted successfully!`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.data?.message || 'Failed to delete quizzes',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting quizzes',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchQuizzesForFile = async (fileName: string) => {
    if (!fileName) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Cannot fetch quizzes: File name is missing.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await getQuizzesByFileName(fileName);
      if (response.status === 200) {
        setSelectedFileQuizzes(response.data.data || []);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to fetch quizzes',
        });
        setSelectedFileQuizzes([]);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while fetching quizzes',
      });
      setSelectedFileQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestions = async (file: QuizFile) => {
    if (!file.fileName) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Cannot view quizzes: File name is missing.',
      });
      return;
    }
    setSelectedFile(file);
    await fetchQuizzesForFile(file.fileName);
    setIsViewQuestionsOpen(true);
  };

  const handleExcelUpload = async (data: ExcelUploadFormData) => {
    if (!excelFile) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select an Excel file to upload (.xlsx or .xls)',
      });
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!validTypes.includes(excelFile.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid file type. Please upload a .xlsx or .xls file.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No quiz data found in the Excel file',
          });
          setIsLoading(false);
          return;
        }

        const quizzes = jsonData.map((row: any) => ({
          Question: row.Question?.toString().trim() || '',
          Options: row.Options ? row.Options.split(',').map((opt: string) => opt.trim()) : [],
          CorrectAnswer: row.CorrectAnswer?.toString().trim() || '',
        }));

        const validQuizzes = quizzes.filter(
          (quiz) =>
            quiz.Question &&
            quiz.Options.length === 4 &&
            quiz.Options.every((opt: string) => opt !== '') &&
            quiz.Options.includes(quiz.CorrectAnswer)
        );

        if (validQuizzes.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No valid quizzes found in the Excel file. Ensure each question has a question text, exactly 4 options, and a valid correct answer.',
          });
          setIsLoading(false);
          return;
        }

        try {
          const response = await axios.post(
            `${backEndUrl}/quiz/upload`,
            { quizzes: validQuizzes, course: data.course, fileName: excelFile.name },
            {
              ...jsonconfig,
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (response.status === 201) {
            await fetchQuizFiles();
            setIsExcelUploadOpen(false);
            setExcelFile(null);
            resetExcel();
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: response.data.message || 'Quizzes uploaded successfully!',
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.data?.message || 'Failed to upload quizzes',
            });
          }
        } catch (error: any) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'An error occurred while uploading quizzes',
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to read the Excel file',
        });
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(excelFile);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while processing the Excel file',
      });
      setIsLoading(false);
    }
  };

  const openEditDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteOpen(true);
  };

  const openAddDialog = () => {
    if (selectedFile) {
      setValue('Course', selectedFile.Course);
      setValue('fileName', selectedFile.fileName || '');
    }
    setIsAddOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-green-600" />
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortField('fileName');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const correctAnswerOptions = watch('Options').map((option, index) => ({
    value: option,
    label: option || `Option ${['A', 'B', 'C', 'D'][index]}`,
  }));

  const InputField: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    type?: string;
    placeholder: string;
    register: any;
    error?: any;
    className?: string;
    disabled?: boolean;
  }> = ({ id, label, icon: Icon, type = 'text', placeholder, register, error, className = '', disabled = false }) => (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide"
      >
        <Icon className="w-4 h-4 text-green-600" />
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          {...register}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-12 px-4 pr-12 text-gray-800 placeholder-gray-400 bg-white/90 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 backdrop-blur-sm ${
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
          } ${className}`}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Icon className={`w-5 h-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
          {error.message}
        </div>
      )}
    </div>
  );

  if (isPageLoading) {
    return (
      <MainLayout title="Quiz Upload">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading quiz files...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Quiz Upload">
      <div className="min-h-screen max-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Quiz File Management
              </h1>
              <p className="text-gray-600 mt-2">Upload and manage quiz files efficiently</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsExcelUploadOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Upload className="w-5 h-5" />
                Upload Excel
              </button>
              <button
                onClick={handleDeleteAllQuizzes}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Trash className="w-5 h-5" />
                Delete All
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Search className="w-4 h-4 text-green-600" />
                  Search Quiz Files
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by file name, course..."
                    className="w-full h-12 px-4 pr-12 text-gray-800 placeholder-gray-400 bg-white/90 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-green-500 hover:border-gray-300"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Filter className="w-4 h-4 text-green-600" />
                  Filter by Course
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-4 pr-12 text-gray-800 bg-white/90 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-green-500 hover:border-gray-300 appearance-none"
                  >
                    <option value="">All Courses</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Items per page
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-12 px-4 pr-12 text-gray-800 bg-white/90 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-green-500 hover:border-gray-300 appearance-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="h-12 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
              >
                Clear Filters
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {getPaginatedQuizFiles().length} of {paginationInfo.totalItems} quiz files
              {searchTerm && ` (filtered from ${quizFiles.length} total)`}
            </div>
          </div>

          <div className="bg-white/80 overflow-x-auto backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">S.No</th>
                    <th
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('fileName')}
                    >
                      <div className="flex items-center gap-2">
                        File Name
                        {getSortIcon('fileName')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('Course')}
                    >
                      <div className="flex items-center gap-2">
                        Course
                        {getSortIcon('Course')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Quiz Count</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedQuizFiles().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                          <FileText className="w-12 h-12 text-gray-300" />
                          <div>
                            <p className="text-lg font-medium">No quiz files found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getPaginatedQuizFiles().map((file, index) => (
                      <tr
                        key={file.fileName || `index-${index}`}
                        className={`border-b border-gray-100 hover:bg-green-50/50 transition-colors ${
                          index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="min-w-10 min-h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {file.fileName ? file.fileName.charAt(0) : '?'}
                            </div>
                            <span className="font-medium text-gray-900">
                              {file.fileName || 'Unknown File'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {file.Course}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{file.count}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleViewQuestions(file)}
                              className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                              disabled={!file.fileName}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuizzesByFileName(file)}
                              className="p-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                              disabled={!file.fileName}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {paginationInfo.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {paginationInfo.currentPage} of {paginationInfo.totalPages} (
                    {paginationInfo.totalItems} total items)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                        let pageNum;
                        if (paginationInfo.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= paginationInfo.totalPages - 2) {
                          pageNum = paginationInfo.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-green-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(paginationInfo.totalPages, currentPage + 1))}
                      disabled={currentPage === paginationInfo.totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isViewQuestionsOpen && selectedFile && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#f6f6f6] backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Eye className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">View Quizzes</h2>
                        <p className="text-blue-100 mt-1">
                          File: {selectedFile.fileName || 'Unknown'} ({selectedFile.Course})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsViewQuestionsOpen(false);
                        setSelectedFile(null);
                        setSelectedFileQuizzes([]);
                      }}
                      className="text-white hover:text-gray-200"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={openAddDialog}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      Add Quiz to File
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {isLoading ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading quizzes...</p>
                    </div>
                  ) : selectedFileQuizzes.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No quizzes found in this file</p>
                      <p className="text-sm">Add a new quiz to get started</p>
                    </div>
                  ) : (
                    <div className="bg-white/80 overflow-x-auto rounded-2xl shadow-lg border border-white/20">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                            <th className="px-6 py-4 text-left font-semibold">S.No</th>
                            <th className="px-6 py-4 text-left font-semibold">Question</th>
                            <th className="px-6 py-4 text-left font-semibold">Options</th>
                            <th className="px-6 py-4 text-left font-semibold">Correct Answer</th>
                            <th className="px-6 py-4 text-center font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFileQuizzes.map((quiz, index) => (
                            <tr
                              key={quiz._id}
                              className={`border-b border-gray-100 hover:bg-green-50/50 transition-colors ${
                                index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'
                              }`}
                            >
                              <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="min-w-10 min-h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {quiz.Question.charAt(0)}
                                  </div>
                                  <span className="font-medium text-gray-900">{quiz.Question}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{quiz.Options.join(', ')}</td>
                              <td className="px-6 py-4 text-gray-600">{quiz.CorrectAnswer}</td>
                              <td className="px-6 py-4">
                                <div className="flex justify-center items-center gap-2">
                                  <button
                                    onClick={() => openEditDialog(quiz)}
                                    className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteDialog(quiz)}
                                    className="p-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAddOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#f6f6f6] backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Plus className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Add New Quiz</h2>
                      <p className="text-green-100 mt-1">Fill in the details to create a new quiz</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(handleAddQuiz)} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="question"
                      label="Question"
                      icon={FileText}
                      placeholder="Enter question"
                      register={register('Question', {
                        required: 'Question is required',
                        minLength: { value: 2, message: 'Question must be at least 2 characters' },
                      })}
                      error={errors.Question}
                    />
                    <InputField
                      id="course"
                      label="Course"
                      icon={FileText}
                      placeholder="Math, Science, etc."
                      register={register('Course', {
                        required: 'Course is required',
                        minLength: { value: 2, message: 'Course must be at least 2 characters' },
                      })}
                      error={errors.Course}
                      className={selectedFile ? 'bg-gray-100' : ''}
                      disabled={!!selectedFile}
                    />
                    {selectedFile && (
                      <input
                        type="hidden"
                        {...register('fileName')}
                        value={selectedFile.fileName || ''}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Options</h3>
                    {['A', 'B', 'C', 'D'].map((option, index) => (
                      <InputField
                        key={option}
                        id={`option-${option}`}
                        label={`Option ${option}`}
                        icon={FileText}
                        placeholder={`Option ${option}`}
                        register={register(`Options.${index}`, {
                          required: `Option ${option} is required`,
                        })}
                        error={errors.Options?.[index]}
                      />
                    ))}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        <FileText className="w-4 h-4 text-green-600" />
                        Correct Answer
                      </label>
                      <select
                        {...register('CorrectAnswer', {
                          required: 'Correct answer is required',
                       })}
                        className="w-full h-12 px-4 text-gray-800 bg-white/90 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-green-500 hover:border-gray-300"
                      >
                        {correctAnswerOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.CorrectAnswer && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                          <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-xs font-bold">!</span>
                          </div>
                          {errors.CorrectAnswer.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Adding Quiz...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Add Quiz
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isEditOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#f6f6f6] backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Edit className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Edit Quiz</h2>
                      <p className="text-green-100 mt-1">Update the quiz information for {selectedQuiz?.Question}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(handleEditQuiz)} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="edit-question"
                      label="Question"
                      icon={FileText}
                      placeholder="Enter question"
                      register={register('Question', {
                        required: 'Question is required',
                        minLength: { value: 2, message: 'Question must be at least 2 characters' },
                      })}
                      error={errors.Question}
                      className="focus:border-green-500"
                    />
                    <InputField
                      id="edit-course"
                      label="Course"
                      icon={FileText}
                      placeholder="Math, Science, etc."
                      register={register('Course', {
                        required: 'Course is required',
                        minLength: { value: 2, message: 'Course must be at least 2 characters' },
                      })}
                      error={errors.Course}
                      className="focus:border-green-500"
                      disabled={true}
                    />
                    <input
                      type="hidden"
                      {...register('fileName')}
                      value={selectedQuiz?.fileName}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Options</h3>
                    {['A', 'B', 'C', 'D'].map((option, index) => (
                      <InputField
                        key={option}
                        id={`edit-option-${option}`}
                        label={`Option ${option}`}
                        icon={FileText}
                        placeholder={`Option ${option}`}
                        register={register(`Options.${index}`, {
                          required: `Option ${option} is required`,
                        })}
                        error={errors.Options?.[index]}
                      />
                    ))}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        <FileText className="w-4 h-4 text-green-600" />
                        Correct Answer
                      </label>
                      <select
                        {...register('CorrectAnswer', {
                          required: 'Correct answer is required',
                        })}
                        className="w-full h-12 px-4 text-gray-800 bg-white/90 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-green-500 hover:border-gray-300"
                      >
                        {correctAnswerOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.CorrectAnswer && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                          <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-xs font-bold">!</span>
                          </div>
                          {errors.CorrectAnswer.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating Quiz...
                        </>
                      ) : (
                        <>
                          <Edit className="w-5 h-5" />
                          Update Quiz
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isExcelUploadOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#f6f6f6] backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Upload Quiz via Excel</h2>
                      <p className="text-blue-100 mt-1">Upload an Excel file containing quiz data</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitExcel(handleExcelUpload)} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      <FileText className="w-4 h-4 text-green-600" />
                      Select Excel File
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                      className="w-full h-12 px-4 text-gray-800 bg-white/90 border-2 border-gray-200 rounded-xl transition-all duration-200"
                    />
                  </div>

                  <InputField
                    id="course"
                    label="Course"
                    icon={FileText}
                    placeholder="Enter course name (e.g., Math)"
                    register={registerExcel('course', {
                      required: 'Course is required',
                      minLength: { value: 2, message: 'Course must be at least 2 characters' },
                    })}
                    error={errorsExcel.course}
                  />

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExcelUploadOpen(false);
                        setExcelFile(null);
                        resetExcel();
                      }}
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading Quiz...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Quiz
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isDeleteOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#f6f6f6] backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-white/20">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Trash className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Delete Quiz</h2>
                      <p className="text-red-100 mt-1">This action cannot be undone</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        {selectedQuiz?.Question?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-blue-800 text-xl font-bold">{selectedQuiz?.Question || 'Unknown'}</h3>
                        <p className="text-blue-600">{selectedQuiz?.Course || 'Unknown'}</p>
                        <p className="text-blue-600">{selectedQuiz?.Options.length || 0} Options</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Warning</h4>
                        <p className="text-amber-600 text-sm">
                          This will permanently delete the quiz and all associated data.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsDeleteOpen(false)}
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                    >
                      Keep Quiz
                    </button>
                    <button
                      onClick={handleDeleteQuiz}
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Deleting Quiz...
                        </>
                      ) : (
                        <>
                          <Trash className="w-4 h-4" />
                          Delete Permanently
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizUpload;