import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Download, 
  Thermometer, 
  Search, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Camera,
  Image as ImageIcon,
  Zap,
  LayoutDashboard,
  Settings2,
  RotateCcw,
  Undo2,
  History,
  Loader2,
  GripVertical,
  Save
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { analyzeThermalImage } from './services/ocrService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ThermalReport, 
  ThermalMeasurementItem, 
  MeasurementStatus, 
  ReportType, 
  VoltageType 
} from './types';
import { generateThermalExcel } from './lib/excel-utils';
import { cn } from './lib/utils';

// Helper to get local date string (YYYY-MM-DD)
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_SUBSTATION_ITEMS: ThermalMeasurementItem[] = [
  { id: 's1', targetName: 'HV1/케이블헤드 접속부', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's2', targetName: 'HV1/LA', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's3', targetName: 'HV1/MOF', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's4', targetName: 'HV1/CT', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's5', targetName: 'TR1/TR 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's6', targetName: 'TR1/TR 2차', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's7', targetName: 'TR2/TR 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's8', targetName: 'TR2/TR 2차', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's9', targetName: 'TR3/TR 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's10', targetName: 'TR3/TR 2차', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's11', targetName: 'TR4/TR 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's12', targetName: 'TR4/TR 2차', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's13', targetName: 'TR1/VCB 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's14', targetName: 'TR2/VCB 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's15', targetName: 'TR3/VCB 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's16', targetName: 'TR4/VCB 1차', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's17', targetName: 'TR1/CT', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's18', targetName: 'TR2/CT', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's19', targetName: 'TR3/CT', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's20', targetName: 'TR4/CT', voltage: '22.9kv', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's21', targetName: 'LV1/ACB 1차 모선', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's22', targetName: 'LV2/ACB 1차 모선', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's23', targetName: 'LV3/ACB 1차 모선', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 's24', targetName: 'LV4/ACB 1차 모선', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
];

const DEFAULT_DISTRIBUTION_ITEMS: ThermalMeasurementItem[] = [
  { id: 'd1', targetName: 'UT-6(4F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd2', targetName: 'LP-4-1(4F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd3', targetName: 'LP-4(4F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd4', targetName: 'LP-301(3F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd5', targetName: 'P-5(3F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd6', targetName: 'LPC-M(3F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd7', targetName: 'P-17(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd8', targetName: 'P-14(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd9', targetName: 'P-13(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd10', targetName: 'UT-12-1(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd11', targetName: 'UT-12(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd12', targetName: '공압기 냉각수 판넬(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd13', targetName: 'P-16(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd14', targetName: 'LP-B1(B1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd15', targetName: 'LP-201(2F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd16', targetName: 'P-3(2F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd17', targetName: 'P-4(2F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd18', targetName: 'LP-2(2F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd19', targetName: 'LP-101(1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd20', targetName: 'P-1(1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd21', targetName: 'P-10(1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd22', targetName: 'P-2(1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd23', targetName: 'LP-1(1F)', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd24', targetName: 'UT-8', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
  { id: 'd25', targetName: 'UT-9', voltage: '380v', point1: null, point2: null, point3: null, maxDiff: 0, status: '정상' },
];



const INITIAL_REPORTS: ThermalReport[] = [
  {
    id: '1',
    type: '수변전실',
    projectName: '적외선 열화상측정 리스트(수변전실)',
    inspectionDate: getTodayDate(),
    inspector: '시설환경팀',
    location: '',
    items: DEFAULT_SUBSTATION_ITEMS
  },
  {
    id: '2',
    type: '분전반',
    projectName: '적외선 열화상측정 리스트(분전반)',
    inspectionDate: getTodayDate(),
    inspector: '시설환경팀',
    location: '',
    items: DEFAULT_DISTRIBUTION_ITEMS
  }
];

export default function App() {
  // Load initial data from localStorage
  const [reports, setReports] = useState<ThermalReport[]>(() => {
    const saved = localStorage.getItem('thermal_reports');
    let data: ThermalReport[] = saved ? JSON.parse(saved) : INITIAL_REPORTS;
    
    // Patch reports with their respective default templates on refresh
    data = data.map(report => {
      const templateStr = localStorage.getItem(`thermal_template_v3_${report.id}`);
      
      if (templateStr) {
        try {
          const template = JSON.parse(templateStr);
          return { 
            ...report, 
            ...template,
            inspectionDate: getTodayDate() // Always keep date current
          };
        } catch (e) {
          console.error('Failed to parse template', e);
        }
      }

      // Fallback to factory defaults for ID 1 and 2 if no custom template exists
      if (report.id === '1') {
        return { 
          ...report, 
          projectName: '적외선 열화상측정 리스트(수변전실)',
          items: DEFAULT_SUBSTATION_ITEMS, 
          inspectionDate: getTodayDate() 
        };
      }
      if (report.id === '2') {
        return { 
          ...report, 
          projectName: '적외선 열화상측정 리스트(분전반)',
          items: DEFAULT_DISTRIBUTION_ITEMS, 
          inspectionDate: getTodayDate() 
        };
      }
      return report;
    });

    return data;
  });
  
  const [deletedReports, setDeletedReports] = useState<ThermalReport[]>(() => {
    const saved = localStorage.getItem('thermal_deleted_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('thermal_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('thermal_deleted_reports', JSON.stringify(deletedReports));
  }, [deletedReports]);

  // Handle "Default Page" request: On load, we don't select any report automatically
  // so the user sees the "Please select a report" dashboard view.
  useEffect(() => {
    // If the user wants to always see the "Initial Dashboard" on refresh,
    // we ensure selectedReport is null on mount (which it is by default).
    setSelectedReport(null);
  }, []);

  const [selectedReport, setSelectedReport] = useState<ThermalReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ reportId: string, itemId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<{ itemId: string, type: 'visual' | 'thermal' } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New Report Form State
  const [newReport, setNewReport] = useState<Partial<ThermalReport>>({
    projectName: '',
    type: '수변전실',
    inspectionDate: getTodayDate(),
    inspector: '시설환경팀',
    location: '',
    items: []
  });

  useEffect(() => {
    if (isCreateDialogOpen) {
      setNewReport(prev => ({
        ...prev,
        inspectionDate: getTodayDate()
      }));
    }
  }, [isCreateDialogOpen]);

  const filteredReports = reports.filter(r => 
    r.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.inspector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = () => {
    if (!newReport.projectName || !newReport.inspector) return;
    
    const defaultItems = newReport.type === '수변전실' 
      ? DEFAULT_SUBSTATION_ITEMS.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }))
      : DEFAULT_DISTRIBUTION_ITEMS.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }));

    const report: ThermalReport = {
      id: Math.random().toString(36).substr(2, 9),
      type: newReport.type as ReportType,
      projectName: newReport.projectName!,
      inspectionDate: newReport.inspectionDate!,
      inspector: newReport.inspector!,
      location: newReport.location || '',
      items: defaultItems
    };
    
    setReports([report, ...reports]);
    setIsCreateDialogOpen(false);
    setNewReport({
      projectName: '',
      type: '수변전실',
      inspectionDate: getTodayDate(),
      inspector: '시설환경팀',
      location: '',
      items: []
    });
    setSelectedReport(report);
  };

  const handleRestoreDefaultItems = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const templateStr = localStorage.getItem(`thermal_template_v3_${report.id}`);
    let defaultItems: ThermalMeasurementItem[] = [];

    if (templateStr) {
      try {
        const template = JSON.parse(templateStr);
        // Deep copy items from template and give them new IDs to avoid dnd issues if needed, 
        // but user might want to keep IDs. Let's keep them but ensure they are fresh objects.
        defaultItems = template.items.map((item: any) => ({ ...item }));
      } catch (e) {
        console.error('Failed to parse template during restore', e);
      }
    }

    // Fallback to factory defaults if no template
    if (defaultItems.length === 0) {
      defaultItems = report.type === '수변전실' 
        ? DEFAULT_SUBSTATION_ITEMS.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }))
        : DEFAULT_DISTRIBUTION_ITEMS.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }));
    }

    handleUpdateReport(reportId, { items: defaultItems });
  };

  const handleAddItem = (reportId: string) => {
    const newItem: ThermalMeasurementItem = {
      id: Math.random().toString(36).substr(2, 9),
      targetName: '',
      voltage: '380v',
      point1: null,
      point2: null,
      point3: null,
      maxDiff: 0,
      status: '정상'
    };

    const updatedReports = reports.map(r => {
      if (r.id === reportId) {
        return { ...r, items: [...r.items, newItem] };
      }
      return r;
    });

    setReports(updatedReports);
    setSelectedReport(updatedReports.find(r => r.id === reportId) || null);
  };

  const handleDeleteReport = (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    setReportToDelete(reportId);
  };

  const confirmDeleteReport = () => {
    if (!reportToDelete) return;
    
    const reportToMove = reports.find(r => r.id === reportToDelete);
    if (reportToMove) {
      setDeletedReports([reportToMove, ...deletedReports]);
      const updatedReports = reports.filter(r => r.id !== reportToDelete);
      setReports(updatedReports);
      if (selectedReport?.id === reportToDelete) {
        setSelectedReport(null);
      }
    }
    setReportToDelete(null);
  };

  const handleRestoreReport = (reportId: string) => {
    const reportToRestore = deletedReports.find(r => r.id === reportId);
    if (reportToRestore) {
      setReports([reportToRestore, ...reports]);
      setDeletedReports(deletedReports.filter(r => r.id !== reportId));
    }
  };

  const handlePermanentDelete = (reportId: string) => {
    setDeletedReports(deletedReports.filter(r => r.id !== reportId));
  };

  const handleResetToDefault = () => {
    if (window.confirm('모든 데이터를 초기화하고 기본 목록(NO 01, NO 02)으로 복구하시겠습니까? 현재 작성 중인 모든 데이터가 삭제됩니다.')) {
      localStorage.removeItem('thermal_reports');
      localStorage.removeItem('thermal_deleted_reports');
      window.location.reload();
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedReport) return;

    const items: ThermalMeasurementItem[] = Array.from(selectedReport.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    handleUpdateReport(selectedReport.id, { items } as Partial<ThermalReport>);
  };

  const handleUpdateItem = (reportId: string, itemId: string, updates: Partial<ThermalMeasurementItem>) => {
    setReports(prevReports => {
      const updatedReports = prevReports.map(r => {
        if (r.id === reportId) {
          const updatedItems = r.items.map(item => {
            if (item.id === itemId) {
              const newItem = { ...item, ...updates };
              
              // Auto calculate max difference and status
              if ('point1' in updates || 'point2' in updates || 'point3' in updates) {
                const temps = [newItem.point1, newItem.point2, newItem.point3].filter((t): t is number => t !== null);
                if (temps.length > 0) {
                  const max = Math.max(...temps);
                  const min = Math.min(...temps);
                  newItem.maxDiff = Number((max - min).toFixed(1));
                  
                  if (newItem.maxDiff > 10) newItem.status = '이상';
                  else if (newItem.maxDiff > 5) newItem.status = '요주의';
                  else newItem.status = '정상';
                } else {
                  newItem.maxDiff = 0;
                  newItem.status = '정상';
                }
              }
              return newItem;
            }
            return item;
          });
          return { ...r, items: updatedItems };
        }
        return r;
      });

      // Sync selected report
      const updatedSelected = updatedReports.find(r => r.id === reportId);
      if (updatedSelected) {
        setSelectedReport(updatedSelected);
      }

      return updatedReports;
    });
  };

  const handleUpdateReport = (reportId: string, updates: Partial<ThermalReport>) => {
    setReports(prevReports => {
      const updatedReports = prevReports.map(r => {
        if (r.id === reportId) {
          return { ...r, ...updates };
        }
        return r;
      });
      
      const updatedSelected = updatedReports.find(r => r.id === reportId);
      if (updatedSelected) {
        setSelectedReport(updatedSelected);
      }
      
      return updatedReports;
    });
  };

  const handleSaveAsDefault = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Save the current state as the new default template for this report
    const template = {
      projectName: report.projectName,
      inspector: report.inspector,
      location: report.location,
      items: report.items // Save items exactly as they are (including added points and modifications)
    };

    const key = `thermal_template_v3_${report.id}`;
    localStorage.setItem(key, JSON.stringify(template));
    alert('현재 구성(항목 리스트, 수정 내용, 추가된 포인트 등)이 기본 템플릿으로 저장되었습니다. 이제 새로고침 시 이 상태로 시작됩니다.');
  };

  const handleDeleteItem = (reportId: string, itemId: string) => {
    setItemToDelete({ reportId, itemId });
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    const { reportId, itemId } = itemToDelete;

    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, items: r.items.filter(i => i.id !== itemId) };
      }
      return r;
    }));

    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => {
        if (!prev) return null;
        return { ...prev, items: prev.items.filter(i => i.id !== itemId) };
      });
    }

    setItemToDelete(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor || !selectedReport) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      // Update image first
      handleUpdateItem(
        selectedReport.id, 
        uploadingFor.itemId, 
        uploadingFor.type === 'visual' ? { visualImage: base64 } : { thermalImage: base64 }
      );

      // If it's a thermal image, analyze it
      if (uploadingFor.type === 'thermal') {
        setIsAnalyzing(true);
        try {
          const thermalData = await analyzeThermalImage(base64);
          if (thermalData) {
            handleUpdateItem(selectedReport.id, uploadingFor.itemId, {
              point1: thermalData.point1,
              point2: thermalData.point2,
              point3: thermalData.point3,
            });
          }
        } finally {
          setIsAnalyzing(false);
        }
      }
      
      setUploadingFor(null);
    };
    reader.readAsDataURL(file);
  };

  const getStatusBadge = (status: MeasurementStatus) => {
    switch (status) {
      case '정상': return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1" /> 정상</Badge>;
      case '요주의': return <Badge className="bg-amber-500 hover:bg-amber-600"><Info className="w-3 h-3 mr-1" /> 요주의</Badge>;
      case '이상': return <Badge className="bg-rose-500 hover:bg-rose-600"><AlertTriangle className="w-3 h-3 mr-1" /> 이상</Badge>;
    }
  };

  const StatusPopover = ({ status, items, currentIndex }: { status: MeasurementStatus, items: ThermalMeasurementItem[], currentIndex: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const sameStatusItems = items.filter(i => i.status === status);
    
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger 
          nativeButton={false}
          render={
            <div 
              className="cursor-pointer inline-block transition-transform hover:scale-105 active:scale-95 border-none bg-transparent p-0 outline-none"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {getStatusBadge(status)}
            </div>
          }
        />
        <PopoverContent 
          className="w-72 p-0 overflow-hidden shadow-2xl border-none" 
          align="center"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className={cn(
            "px-4 py-3 flex items-center justify-between text-white",
            status === '정상' ? "bg-emerald-500" : status === '요주의' ? "bg-amber-500" : "bg-rose-500"
          )}>
            <div className="flex items-center gap-2">
              {status === '정상' ? <CheckCircle2 className="w-4 h-4" /> : status === '요주의' ? <Info className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span className="text-xs font-black uppercase tracking-widest">{status} 리스트</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-white/30 text-white font-black">
              {sameStatusItems.length} POINTS
            </Badge>
          </div>
          <ScrollArea className="max-h-[280px] bg-white">
            <div className="p-2 space-y-1">
              {sameStatusItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-[10px] font-bold">항목이 없습니다.</div>
              ) : (
                sameStatusItems.map((item) => {
                  const itemIndex = items.findIndex(i => i.id === item.id);
                  const isCurrent = itemIndex === currentIndex;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl transition-all border",
                        isCurrent 
                          ? "bg-blue-50 border-blue-100 ring-1 ring-blue-200" 
                          : "hover:bg-slate-50 border-transparent hover:border-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
                          isCurrent ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          {String(itemIndex + 1).padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "text-xs font-black truncate",
                            isCurrent ? "text-blue-700" : "text-slate-700"
                          )}>
                            {item.targetName || '(이름 없음)'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400">{item.voltage}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-[11px] font-black",
                          status === '이상' ? "text-rose-600" : status === '요주의' ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {item.maxDiff}°C
                        </p>
                        {isCurrent && <Badge className="text-[8px] h-3 px-1 bg-blue-600 font-black">CURRENT</Badge>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <div className="p-2 bg-slate-50 border-t border-slate-100">
            <p className="text-[9px] text-center font-bold text-slate-400 italic">
              * 동일한 판정 결과를 가진 모든 측정 포인트를 표시합니다.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const stats = selectedReport ? {
    total: selectedReport.items.length,
    normal: selectedReport.items.filter(i => i.status === '정상').length,
    caution: selectedReport.items.filter(i => i.status === '요주의').length,
    danger: selectedReport.items.filter(i => i.status === '이상').length,
  } : null;

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

      {/* Deletion Confirmation Dialog */}
      <Dialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" /> 보고서 삭제
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-600 pt-2">
              정말로 이 보고서를 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              삭제된 보고서는 <span className="font-bold text-blue-600">쓰레기통</span>으로 이동하며, 나중에 다시 복구할 수 있습니다.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReportToDelete(null)} className="font-bold">취소</Button>
            <Button className="bg-rose-600 hover:bg-rose-700 font-bold" onClick={confirmDeleteReport}>삭제하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Deletion Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" /> 측정 항목 삭제
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-600 pt-2">
              선택한 측정 포인트를 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              삭제된 포인트는 복구할 수 없습니다. 계속하시겠습니까?
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setItemToDelete(null)} className="font-bold">취소</Button>
            <Button variant="destructive" onClick={confirmDeleteItem} className="font-bold">삭제하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl border flex flex-col items-center gap-4 text-center max-w-xs">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">이미지 분석 중...</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">무료 OCR 기능을 사용하여 온도를 추출하고 있습니다.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Thermal Insight Pro</h1>
              <p className="text-[10px] text-blue-600 uppercase tracking-widest font-black">Infrared Inspection System</p>
            </div>
          </div>
          
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="보고서 검색..." 
                  className="pl-9 w-64 bg-slate-100 border-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => window.location.reload()}
                title="새로고침"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Dialog open={isTrashOpen} onOpenChange={setIsTrashOpen}>
                <DialogTrigger 
                  render={
                    <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      <History className="w-5 h-5" />
                      {deletedReports.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {deletedReports.length}
                        </span>
                      )}
                    </Button>
                  } 
                />
                <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" /> 삭제된 보고서 (쓰레기통)
                  </DialogTitle>
                  <DialogDescription>삭제된 보고서를 복구하거나 영구 삭제할 수 있습니다.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] mt-4">
                  {deletedReports.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">쓰레기통이 비어 있습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pr-4">
                      {deletedReports.map(report => (
                        <div key={report.id} className="p-4 rounded-xl border bg-slate-50/50 flex items-center justify-between group">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm">{report.projectName}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{report.inspectionDate} · {report.items.length} Points</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-blue-600 hover:bg-blue-100 font-bold text-xs"
                              onClick={() => handleRestoreReport(report.id)}
                            >
                              <Undo2 className="w-3.5 h-3.5 mr-1" /> 복구
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-rose-600 hover:bg-rose-100 font-bold text-xs"
                              onClick={() => handlePermanentDelete(report.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> 영구 삭제
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger 
                render={
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 font-bold">
                    <Plus className="w-4 h-4 mr-2" /> 새 보고서
                  </Button>
                } 
              />
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">새 측정 보고서 생성</DialogTitle>
                  <DialogDescription>점검 대상 및 기본 정보를 입력하세요.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="grid gap-2">
                    <Label className="font-bold">보고서 종류</Label>
                    <div className="flex gap-2">
                      {(['수변전실', '분전반'] as ReportType[]).map(t => (
                        <Button 
                          key={t}
                          variant={newReport.type === t ? 'default' : 'outline'}
                          className="flex-1 font-bold"
                          onClick={() => setNewReport({...newReport, type: t})}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="projectName" className="font-bold">프로젝트명</Label>
                    <Input 
                      id="projectName" 
                      placeholder="예: 2024 상반기 정기점검" 
                      value={newReport.projectName}
                      onChange={(e) => setNewReport({...newReport, projectName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="inspector" className="font-bold">점검자</Label>
                      <Input 
                        id="inspector" 
                        placeholder="이름" 
                        value={newReport.inspector}
                        onChange={(e) => setNewReport({...newReport, inspector: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date" className="font-bold">점검일자</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={newReport.inspectionDate}
                        onChange={(e) => setNewReport({...newReport, inspectionDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location" className="font-bold">점검장소</Label>
                    <Input 
                      id="location" 
                      placeholder="상세 위치" 
                      value={newReport.location}
                      onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>취소</Button>
                  <Button className="bg-blue-600" onClick={handleCreateReport} disabled={!newReport.projectName || !newReport.inspector}>보고서 생성</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" /> 측정 리스트
              </h2>
              <Badge variant="secondary" className="text-[10px] font-bold">{filteredReports.length} REPORTS</Badge>
            </div>
            <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedReport(report)}
                    className={cn(
                      "p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                      selectedReport?.id === report.id 
                        ? "bg-white border-blue-600 shadow-xl shadow-blue-100/50" 
                        : "bg-white border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <Badge className={cn(
                          "text-[9px] font-black tracking-tighter",
                          report.type === '수변전실' ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {report.type}
                        </Badge>
                        <h3 className="font-black text-slate-900 leading-tight line-clamp-1">{report.projectName}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={(e) => handleDeleteReport(e, report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", selectedReport?.id === report.id ? "rotate-90 text-blue-600" : "text-slate-300 group-hover:translate-x-1")} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {report.items.length} Points</span>
                      <span>{report.inspectionDate}</span>
                    </div>
                    {selectedReport?.id === report.id && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600" />
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Content: Details & Editor */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedReport ? (
                <motion.div
                  key={selectedReport.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: '정상', val: stats?.normal, color: 'emerald', icon: CheckCircle2 },
                      { label: '요주의', val: stats?.caution, color: 'amber', icon: Info },
                      { label: '이상', val: stats?.danger, color: 'rose', icon: AlertTriangle },
                      { label: '전체', val: stats?.total, color: 'blue', icon: FileSpreadsheet },
                    ].map((s) => (
                      <Card key={s.label} className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-${s.color}-50 text-${s.color}-600`)}>
                            <s.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{s.label}</p>
                            <p className="text-xl font-black text-slate-900">{s.val}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                    <CardHeader className="border-b pb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-black shrink-0">{selectedReport.type}</Badge>
                            <Input 
                              value={selectedReport.projectName}
                              onChange={(e) => handleUpdateReport(selectedReport.id, { projectName: e.target.value })}
                              className="text-2xl font-black tracking-tight border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent h-auto p-0 transition-all"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-[10px] font-black text-slate-400 uppercase">점검자</Label>
                              <Input 
                                value={selectedReport.inspector}
                                onChange={(e) => handleUpdateReport(selectedReport.id, { inspector: e.target.value })}
                                className="h-7 text-xs font-bold w-24 border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent p-1"
                              />
                            </div>
                            <Separator orientation="vertical" className="h-4 hidden md:block" />
                            <div className="flex items-center gap-2">
                              <Label className="text-[10px] font-black text-slate-400 uppercase">날짜</Label>
                              <Input 
                                type="date"
                                value={selectedReport.inspectionDate}
                                onChange={(e) => handleUpdateReport(selectedReport.id, { inspectionDate: e.target.value })}
                                className="h-7 text-xs font-bold w-32 border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent p-1"
                              />
                            </div>
                            <Separator orientation="vertical" className="h-4 hidden md:block" />
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                              <Label className="text-[10px] font-black text-slate-400 uppercase">장소</Label>
                              <Input 
                                value={selectedReport.location}
                                onChange={(e) => handleUpdateReport(selectedReport.id, { location: e.target.value })}
                                className="h-7 text-xs font-bold flex-1 border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent p-1"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-bold text-slate-500 hover:text-blue-600 border-slate-200"
                            onClick={() => handleSaveAsDefault(selectedReport.id)}
                            title="현재 항목 구성을 기본값으로 저장"
                          >
                            <Save className="w-3.5 h-3.5 mr-1.5" /> 기본 항목 저장
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-bold text-slate-500 hover:text-blue-600 border-slate-200"
                            onClick={() => handleRestoreDefaultItems(selectedReport.id)}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> 기본 항목 복구
                          </Button>
                          <Button 
                            onClick={() => generateThermalExcel(selectedReport)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-100"
                          >
                            <Download className="w-4 h-4 mr-2" /> 엑셀 리포트 생성
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-b">
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead className="w-[50px] text-center font-black text-[10px] uppercase">No</TableHead>
                            <TableHead className="font-black text-[10px] uppercase">측정대상 / 전압</TableHead>
                            <TableHead className="text-center font-black text-[10px] uppercase min-w-[280px]">온도측정 (P1 / P2 / P3)</TableHead>
                            <TableHead className="text-center font-black text-[10px] uppercase min-w-[100px]">최대온도차</TableHead>
                            <TableHead className="text-center font-black text-[10px] uppercase">판정</TableHead>
                            <TableHead className="font-black text-[10px] uppercase">종합의견</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                          <Droppable droppableId="measurement-items">
                            {(provided) => (
                              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                {selectedReport.items.map((item, index) => (
                                  // @ts-ignore - Draggable key issue in some environments
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <TableRow 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={cn(
                                          "group transition-colors border-b last:border-0",
                                          snapshot.isDragging ? "bg-blue-50 shadow-md z-50" : "hover:bg-blue-50/30"
                                        )}
                                      >
                                        <TableCell className="w-[40px] p-0 text-center">
                                          <div {...provided.dragHandleProps} className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                                            <GripVertical className="w-4 h-4" />
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-[10px] font-bold text-slate-400">
                                          {String(index + 1).padStart(2, '0')}
                                        </TableCell>
                                        <TableCell>
                                          <div className="space-y-1.5">
                                            <Input 
                                              value={item.targetName} 
                                              onChange={(e) => handleUpdateItem(selectedReport.id, item.id, { targetName: e.target.value })}
                                              className="h-8 font-black border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent transition-all"
                                            />
                                            <div className="flex gap-1">
                                              {(['22.9kv', '380v', '220v'] as VoltageType[]).map(v => (
                                                <button
                                                  key={v}
                                                  onClick={() => handleUpdateItem(selectedReport.id, item.id, { voltage: v })}
                                                  className={cn(
                                                    "px-2 py-0.5 rounded text-[9px] font-black transition-all",
                                                    item.voltage === v ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                  )}
                                                >
                                                  {v}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center justify-center gap-1.5">
                                            {[1, 2, 3].map(p => (
                                              <Input 
                                                key={p}
                                                type="number"
                                                step="0.1"
                                                value={item[`point${p}` as keyof ThermalMeasurementItem] === null ? '' : item[`point${p}` as keyof ThermalMeasurementItem] as number} 
                                                onChange={(e) => {
                                                  const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                                  handleUpdateItem(selectedReport.id, item.id, { [`point${p}`]: val });
                                                }}
                                                className="h-8 w-20 text-center text-xs font-black border-slate-200 focus:ring-2 focus:ring-blue-500"
                                              />
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <div className="flex flex-col items-center">
                                            <span className={cn(
                                              "font-black text-sm",
                                              item.maxDiff > 10 ? "text-rose-600" : item.maxDiff > 5 ? "text-amber-600" : "text-emerald-600"
                                            )}>
                                              {item.maxDiff}°C
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <StatusPopover status={item.status} items={selectedReport.items} currentIndex={index} />
                                        </TableCell>
                                        <TableCell>
                                          <Input 
                                            value={item.opinion || ''} 
                                            onChange={(e) => handleUpdateItem(selectedReport.id, item.id, { opinion: e.target.value })}
                                            placeholder="개별 의견 입력..."
                                            className="h-8 text-xs font-bold border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent transition-all"
                                          />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                              <Popover>
                                                <PopoverTrigger 
                                                  render={
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className={cn(
                                                        "h-8 w-8 transition-all",
                                                        item.thermalImage || item.visualImage ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                      )}
                                                    >
                                                      <Camera className="w-4 h-4" />
                                                    </Button>
                                                  }
                                                />
                                                <PopoverContent className="w-80 p-4" align="end">
                                                  <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                      <h4 className="text-sm font-black text-slate-900">이미지 관리</h4>
                                                      <Badge variant="outline" className="text-[10px] font-bold">{item.targetName}</Badge>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                      <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-slate-400 uppercase text-center">열화상 이미지</Label>
                                                        <div 
                                                          className={cn(
                                                            "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all relative group/img",
                                                            item.thermalImage ? "border-blue-200 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                                                          )}
                                                          onClick={() => document.getElementById(`thermal-upload-${item.id}`)?.click()}
                                                        >
                                                          {item.thermalImage ? (
                                                            <>
                                                              <img src={item.thermalImage} alt="Thermal" className="w-full h-full object-cover" />
                                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Button 
                                                                  size="icon" 
                                                                  variant="destructive" 
                                                                  className="h-8 w-8 rounded-full"
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm('열화상 이미지를 삭제하시겠습니까?')) {
                                                                      handleUpdateItem(selectedReport.id, item.id, { thermalImage: undefined });
                                                                    }
                                                                  }}
                                                                >
                                                                  <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                              </div>
                                                            </>
                                                          ) : (
                                                            <>
                                                              <Plus className="w-5 h-5 text-slate-300" />
                                                              <span className="text-[10px] font-bold text-slate-400">추가</span>
                                                            </>
                                                          )}
                                                          <input 
                                                            id={`thermal-upload-${item.id}`}
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={(e) => {
                                                              setUploadingFor({ itemId: item.id, type: 'thermal' });
                                                              handleImageUpload(e);
                                                            }}
                                                          />
                                                        </div>
                                                      </div>

                                                      <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-slate-400 uppercase text-center">실사 이미지</Label>
                                                        <div 
                                                          className={cn(
                                                            "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all relative group/img",
                                                            item.visualImage ? "border-blue-200 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                                                          )}
                                                          onClick={() => document.getElementById(`visual-upload-${item.id}`)?.click()}
                                                        >
                                                          {item.visualImage ? (
                                                            <>
                                                              <img src={item.visualImage} alt="Visual" className="w-full h-full object-cover" />
                                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Button 
                                                                  size="icon" 
                                                                  variant="destructive" 
                                                                  className="h-8 w-8 rounded-full"
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm('실사 이미지를 삭제하시겠습니까?')) {
                                                                      handleUpdateItem(selectedReport.id, item.id, { visualImage: undefined });
                                                                    }
                                                                  }}
                                                                >
                                                                  <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                              </div>
                                                            </>
                                                          ) : (
                                                            <>
                                                              <Plus className="w-5 h-5 text-slate-300" />
                                                              <span className="text-[10px] font-bold text-slate-400">추가</span>
                                                            </>
                                                          )}
                                                          <input 
                                                            id={`visual-upload-${item.id}`}
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={(e) => {
                                                              setUploadingFor({ itemId: item.id, type: 'visual' });
                                                              handleImageUpload(e);
                                                            }}
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </PopoverContent>
                                              </Popover>

                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDeleteItem(selectedReport.id, item.id)}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </TableBody>
                            )}
                          </Droppable>
                        </Table>
                      </DragDropContext>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 p-4 flex justify-center border-t">
                      <Button 
                        variant="outline" 
                        className="border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-500 hover:text-blue-600 w-full max-w-xs font-bold"
                        onClick={() => handleAddItem(selectedReport.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> 측정 포인트 추가
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Images */}
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-none shadow-lg bg-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <ImageIcon className="w-3 h-3" /> 촬영 이미지
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedReport.items.map(item => (
                          <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                            <p className="text-[11px] font-black text-slate-600">{item.targetName}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div 
                                onClick={() => { setUploadingFor({ itemId: item.id, type: 'visual' }); fileInputRef.current?.click(); }}
                                className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 transition-all overflow-hidden relative group"
                              >
                                {item.visualImage ? (
                                  <>
                                    <img src={item.visualImage} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        className="h-8 w-8" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateItem(selectedReport.id, item.id, { visualImage: undefined });
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-5 h-5 text-slate-300 mb-1" />
                                    <span className="text-[9px] font-bold text-slate-400">실사 이미지</span>
                                  </>
                                )}
                              </div>
                              <div 
                                onClick={() => { setUploadingFor({ itemId: item.id, type: 'thermal' }); fileInputRef.current?.click(); }}
                                className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 transition-all overflow-hidden relative group"
                              >
                                {item.thermalImage ? (
                                  <>
                                    <img src={item.thermalImage} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        className="h-8 w-8" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateItem(selectedReport.id, item.id, { thermalImage: undefined, point1: 0, point2: 0, point3: 0 });
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Thermometer className="w-5 h-5 text-slate-300 mb-1" />
                                    <span className="text-[9px] font-bold text-slate-400">열화상 이미지</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200 relative">
                    <FileSpreadsheet className="w-12 h-12" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-xl font-black text-slate-900 mb-2">보고서를 선택하세요</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">왼쪽 리스트에서 기존 보고서를 선택하거나 새 보고서를 생성하여 점검을 시작하세요.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
