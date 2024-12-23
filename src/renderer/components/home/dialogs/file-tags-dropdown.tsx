'use client';

import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import {
  FileTags,
  FileTagType,
  InstrumentType,
  StatusType,
  VersionType,
} from "@renderer/types/tags";
import TagBadge from "@renderer/components/tag-badge";
import { Tag } from "lucide-react";

interface FileTagsDropdownProps {
  tags: FileTags | null;
  setTags: (tags: FileTags | null) => void;
}

export function FileTagsDropdown({ tags, setTags }: FileTagsDropdownProps) {
  const [fileType, setFileType] = useState<FileTagType | null>(null);
  const [status, setStatus] = useState<StatusType | null>(null);
  const [instruments, setInstruments] = useState<InstrumentType[]>([]);
  const [versions, setVersions] = useState<VersionType[]>([]);

  useEffect(() => {
    setTags({
      fileType,
      status,
      instruments,
      versions
    })
  }, [fileType, status, instruments, versions])

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleInstrument = (instrument: InstrumentType) => {
    setInstruments((prev) =>
      prev.includes(instrument) ? prev.filter((i) => i !== instrument) : [...prev, instrument]
    );
  };

  const toggleVersion = (version: VersionType) => {
    setVersions((prev) =>
      prev.includes(version) ? prev.filter((v) => v !== version) : [...prev, version]
    );
  };

  const removeTag = (tag: string, type: string) => {
    if (type === "fileType") setFileType(null);
    if (type === "status") setStatus(null);
    if (type === "instruments") setInstruments(instruments.filter((item) => item !== tag));
    if (type === "versions") setVersions(versions.filter((item) => item !== tag));
  };

  return (
    <div className="w-full space-y-2">
      {/* Tag Input Row */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-md bg-background px-3 pb-2"
        onClick={() => dropdownRef.current?.focus()}
      >
        {fileType && (
          <TagBadge
            tag={fileType}
            property="fileType"
            onRemove={() => removeTag(fileType, "fileType")}
          />
        )}
        {status && (
          <TagBadge
            tag={status}
            property="status"
            onRemove={() => removeTag(status, "status")}
          />
        )}
        {instruments.map((instrument) => (
          <TagBadge
            key={instrument}
            tag={instrument}
            property="instruments"
            onRemove={() => removeTag(instrument, "instruments")}
          />
        ))}
        {versions.map((version) => (
          <TagBadge
            key={version}
            tag={version}
            property="versions"
            onRemove={() => removeTag(version, "versions")}
          />
        ))}
      </div>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuContent
          ref={dropdownRef}
          className="max-h-80 w-64 overflow-y-auto space-y-2 p-2"
          align="start"
        >
          {/* File Type */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>File Type</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={fileType as string}
                  onValueChange={(value) => setFileType(value as FileTagType)}
                >
                  {[
                    "Stems",
                    "Mix",
                    "Master",
                    "Reference",
                    "Project File",
                    "Sample Pack",
                    "Recording",
                    "Bounce",
                  ].map((type) => (
                    <DropdownMenuRadioItem key={type} value={type} onSelect={(e) => e.preventDefault()}>
                      {type}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={status as string}
                  onValueChange={(value) => setStatus(value as StatusType)}
                >
                  {[
                    "Draft",
                    "Final",
                    "Approved",
                    "Needs Revision",
                    "Reference Only",
                    "Archive",
                  ].map((status) => (
                    <DropdownMenuRadioItem key={status} value={status} onSelect={(e) => e.preventDefault()}>
                      {status}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Instruments */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Instruments</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {[
                  "Vocals",
                  "Drums",
                  "Bass",
                  "Keys",
                  "Synth",
                  "Guitar",
                  "Strings",
                  "Brass",
                  "FX",
                  "Percussion",
                ].map((instrument) => (
                  <DropdownMenuCheckboxItem
                    key={instrument}
                    checked={instruments.includes(instrument as InstrumentType)}
                    onCheckedChange={() => toggleInstrument(instrument as InstrumentType)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {instrument}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Versions */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Versions</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {["Dry", "Wet", "Edited", "Tuned", "Compressed", "Clean"].map((version) => (
                  <DropdownMenuCheckboxItem
                    key={version}
                    checked={versions.includes(version as VersionType)}
                    onCheckedChange={() => toggleVersion(version as VersionType)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {version}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-max"><Tag/>Edit tags</Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  );
};

export default FileTagsDropdown;




