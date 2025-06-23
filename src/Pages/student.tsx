import React, { useState, useEffect } from 'react';
import { Edit, Plus, Trash, Loader2, User, Mail, Phone, MapPin, GraduationCap, AlertTriangle, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useForm } from "react-hook-form";
import MainLayout from '@/section/MainLayout';
import { addStudent, updateStudent, deleteStudent, getAllStudents } from '../apis/studentApis';
import Swal from 'sweetalert2';

type Student = {
  _id: number;
  name: string;
  email: string;
  number: string;
  address: string;
  course: string;
};

type StudentFormData = Omit<Student, '_id'>;

type SortField = 'name' | 'email' | 'number' | 'course' | '_id';
type SortOrder = 'asc' | 'desc';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const Student: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<StudentFormData>();

  const fetchStudents = async () => {
    setIsPageLoading(true);
    try {
      const response = await getAllStudents();
      if (response?.status === 200) {
        setStudents(response.data.allData || []);
        Swal.fire({
          icon: "success",
          title: 'Success',
          text: 'Students fetched successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: "error",
          title: 'Error',
          text: response.data?.message || 'Failed to fetch students'
        });
        setStudents([]);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while fetching students'
      });
      setStudents([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const uniqueCourses = [...new Set(students.map(student => student.course))].filter(Boolean);

  useEffect(() => {
    let filtered = students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.number ? student.number.toString().includes(searchTerm) : false) ||
        student.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = selectedCourse === '' || student.course === selectedCourse;
      
      return matchesSearch && matchesCourse;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
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

    setFilteredStudents(filtered);
    
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    setPaginationInfo({
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage
    });
    
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [students, searchTerm, selectedCourse, sortField, sortOrder, currentPage, itemsPerPage]);

  const getPaginatedStudents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStudents.slice(startIndex, endIndex);
  };

  useEffect(() => {
    if (!isAddOpen && !isEditOpen) {
      reset();
    }
  }, [isAddOpen, isEditOpen, reset]);

  useEffect(() => {
    if (selectedStudent && isEditOpen) {
      setValue('name', selectedStudent.name);
      setValue('email', selectedStudent.email);
      setValue('number', selectedStudent.number);
      setValue('address', selectedStudent.address);
      setValue('course', selectedStudent.course);
    }
  }, [selectedStudent, isEditOpen, setValue]);

  const handleAddStudent = async (data: StudentFormData) => {
    setIsLoading(true);
    try {
      const response = await addStudent(data);
      if (response.status==201) {
        await fetchStudents();
        setIsAddOpen(false);
        reset();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message || 'Student added successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to add student'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding the student'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = async (data: StudentFormData) => {
    if (!selectedStudent) return;
    
    setIsLoading(true);
    try {
      const formData = { ...data };
      const response = await updateStudent(formData, selectedStudent._id);
      if (response.status==200) {
        await fetchStudents();
        setIsEditOpen(false);
        setSelectedStudent(null);
        reset();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message || 'Student updated successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to update student'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the student'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    setIsLoading(true);
    try {
      const response = await deleteStudent(selectedStudent._id);
      if (response.status=200) {
        await fetchStudents();
        setIsDeleteOpen(false);
        setSelectedStudent(null);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message || 'Student deleted successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to delete student'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while deleting the student'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
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
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-green-600" /> : 
      <ArrowDown className="w-4 h-4 text-green-600" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCourse('');
    setSortField('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const InputField: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    type?: string;
    placeholder: string;
    register: any;
    error?: any;
    className?: string;
  }> = ({ id, label, icon: Icon, type = "text", placeholder, register, error, className = "" }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
        <Icon className="w-4 h-4 text-green-600" />
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          {...register}
          placeholder={placeholder}
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
      <MainLayout title="Student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Student">
      <div className="min-h-screen max-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Student Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your students efficiently with our modern interface</p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Search className="w-4 h-4 text-green-600" />
                  Search Students
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, phone..."
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
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full h-12 px-4 pr-12 text-gray-800 bg-white/90 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-green-500 hover:border-gray-300 appearance-none"
                  >
                    <option value="">All Courses</option>
                    {uniqueCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
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
              Showing {getPaginatedStudents().length} of {paginationInfo.totalItems} students
              {searchTerm && ` (filtered from ${students.length} total)`}
            </div>
          </div>
          
          <div className="bg-white/80 overflow-x-auto backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('_id')}
                    >
                      <div className="flex items-center gap-2">
                        ID
                        {getSortIcon('_id')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('number')}
                    >
                      <div className="flex items-center gap-2">
                        Number                      {getSortIcon('number')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Address</th>
                    <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('course')}
                    >
                      <div className="flex items-center gap-2">
                        Course
                        {getSortIcon('course')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedStudents().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                          <User className="w-12 h-12 text-gray-300" />
                          <div>
                            <p className="text-lg font-medium">No students found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getPaginatedStudents().map((student, index) => (
                      <tr key={student._id} className={`border-b border-gray-100 hover:bg-green-50/50 transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 justify-center">
                            <div className="min-w-10 min-h-10 bg-gradient-to-r flex justify-center items-center from-green-600 to-emerald-600 rounded-full flex items-center justify Vereinigen text-white font-semibold">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-gray-600">{student.number}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={student.address}>{student.address}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {student.course}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => openEditDialog(student)}
                              className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(student)}
                              className="p-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
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
                    Page {paginationInfo.currentPage} of {paginationInfo.totalPages} 
                    ({paginationInfo.totalItems} total items)
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
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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

          {isAddOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#f6f6f6] backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Plus className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Add New Student</h2>
                      <p className="text-green-100 mt-1">Fill in the details to add a new student to the system</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit(handleAddStudent)} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="name"
                      label="Full Name"
                      icon={User}
                      placeholder="Enter student name"
                      register={register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      error={errors.name}
                    />
                    <InputField
                      id="email"
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      placeholder="student@university.edu"
                      register={register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      error={errors.email}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="number"
                      label="Phone Number"
                      icon={Phone}
                      placeholder="+1 (555) 123-4567"
                      register={register('number', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\d\-\+\(\)\s]+$/,
                          message: 'Invalid phone number format'
                        }
                      })}
                      error={errors.number}
                    />
                    <InputField
                      id="course"
                      label="Course"
                      icon={GraduationCap}
                      placeholder="Computer Science"
                      register={register('course', {
                        required: 'Course is required',
                        minLength: { value: 2, message: 'Course must be at least 2 characters' }
                      })}
                      error={errors.course}
                    />
                  </div>

                  <InputField
                    id="address"
                    label="Address"
                    icon={MapPin}
                    placeholder="123 University Avenue, City, State 12345"
                    register={register('address', {
                      required: 'Address is required',
                      minLength: { value: 5, message: 'Address must be at least 5 characters' }
                    })}
                    error={errors.address}
                  />

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
                          Adding Student...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Add Student
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
              <div className="bg-[#f6f6f6] backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Edit className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Edit Student</h2>
                      <p className="text-green-100 mt-1">Update the student information for {selectedStudent?.name}</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit(handleEditStudent)} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="edit-name"
                      label="Full Name"
                      icon={User}
                      placeholder="Enter student name"
                      register={register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      error={errors.name}
                      className="focus:border-green-500"
                    />
                    <InputField
                      id="edit-email"
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      placeholder="student@university.edu"
                      register={register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      error={errors.email}
                      className="focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="edit-number"
                      label="Phone Number"
                      icon={Phone}
                      placeholder="+1 (555) 123-4567"
                      register={register('number', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\d\-\+\(\)\s]+$/,
                          message: 'Invalid phone number format'
                        }
                      })}
                      error={errors.number}
                      className="focus:border-green-500"
                    />
                    <InputField
                      id="edit-course"
                      label="Course"
                      icon={GraduationCap}
                      placeholder="Computer Science"
                      register={register('course', {
                        required: 'Course is required',
                        minLength: { value: 2, message: 'Course must be at least 2 characters' }
                      })}
                      error={errors.course}
                      className="focus:border-green-500"
                    />
                  </div>

                  <InputField
                    id="edit-address"
                    label="Address"
                    icon={MapPin}
                    placeholder="123 University Avenue, City, State 12345"
                    register={register('address', {
                      required: 'Address is required',
                      minLength: { value: 5, message: 'Address must be at least 5 characters' }
                    })}
                    error={errors.address}
                    className="focus:border-green-500"
                  />

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
                          Updating Student...
                        </>
                      ) : (
                        <>
                          <Edit className="w-5 h-5" />
                          Update Student
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
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Trash className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Delete Student</h2>
                      <p className="text-green-100 mt-1">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        {selectedStudent?.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-800">{selectedStudent?.name}</h3>
                        <p className="text-red-600">{selectedStudent?.email}</p>
                        <p className="text-red-600">{selectedStudent?.course}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Warning</h4>
                        <p className="text-amber-700 text-sm">
                          This will permanently remove all student data, including grades, attendance records, and enrollment information.
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
                      Keep Student
                    </button>
                    <button
                      onClick={handleDeleteStudent}
                      disabled={isLoading}
                      className="flex-1 h-12 px-6 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Deleting Student...
                        </>
                      ) : (
                        <>
                          <Trash className="w-5 h-5" />
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

export default Student;