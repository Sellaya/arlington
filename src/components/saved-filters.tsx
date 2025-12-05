"use client";

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Filter, Star, Plus, Trash2, Save, X } from 'lucide-react';
import { getSavedFilters, saveFilter, deleteFilter, type SavedFilter, type FilterType } from '@/lib/filter-service';

interface SavedFiltersProps {
  type: FilterType;
  currentFilters: Record<string, any>;
  onApplyFilter: (filters: Record<string, any>) => void;
  onSaveCurrent?: () => void;
}

export function SavedFilters({ type, currentFilters, onApplyFilter, onSaveCurrent }: SavedFiltersProps) {
  const { toast } = useToast();
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [filterName, setFilterName] = React.useState('');
  const [filterDescription, setFilterDescription] = React.useState('');

  React.useEffect(() => {
    setSavedFilters(getSavedFilters(type));
  }, [type]);

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filters);
    toast({
      title: 'Filter applied',
      description: `Applied "${filter.name}" filter`,
    });
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a filter name',
        variant: 'destructive',
      });
      return;
    }

    const newFilter: SavedFilter = {
      id: `custom-${Date.now()}`,
      name: filterName,
      description: filterDescription,
      type,
      filters: currentFilters,
    };

    saveFilter(newFilter);
    setSavedFilters(getSavedFilters(type));
    setShowSaveDialog(false);
    setFilterName('');
    setFilterDescription('');
    
    toast({
      title: 'Filter saved',
      description: `Saved "${filterName}" filter`,
    });
  };

  const handleDeleteFilter = (filterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFilter(filterId, type);
    setSavedFilters(getSavedFilters(type));
    toast({
      title: 'Filter deleted',
      description: 'Filter has been removed',
    });
  };

  const predefinedFilters = savedFilters.filter(f => !f.id.startsWith('custom-'));
  const customFilters = savedFilters.filter(f => f.id.startsWith('custom-'));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Saved Filters</span>
            <span className="sm:hidden">Filters</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Saved Filter Sets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {predefinedFilters.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Presets</DropdownMenuLabel>
              {predefinedFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => handleApplyFilter(filter)}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{filter.name}</span>
                      {filter.isDefault && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    {filter.description && (
                      <p className="text-xs text-muted-foreground truncate">{filter.description}</p>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}

          {customFilters.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Custom</DropdownMenuLabel>
                {customFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => handleApplyFilter(filter)}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="truncate">{filter.name}</span>
                      {filter.description && (
                        <p className="text-xs text-muted-foreground truncate">{filter.description}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteFilter(filter.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
            <Save className="h-4 w-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Set</DialogTitle>
            <DialogDescription>
              Save your current filter settings for quick access later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                placeholder="e.g., Today's High-Value Leads"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Description (Optional)</Label>
              <Textarea
                id="filter-description"
                placeholder="Brief description of what this filter shows..."
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFilter}>
                <Save className="h-4 w-4 mr-2" />
                Save Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

