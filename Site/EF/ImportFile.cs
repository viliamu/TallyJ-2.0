//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TallyJ.EF
{
    using System;
    using System.Collections.Generic;
    
    public partial class ImportFile
    {
        public int C_RowId { get; set; }
        public System.Guid ElectionGuid { get; set; }
        public Nullable<System.DateTime> UploadTime { get; set; }
        public Nullable<System.DateTime> ImportTime { get; set; }
        public Nullable<int> FileSize { get; set; }
        public Nullable<bool> HasContent { get; set; }
        public Nullable<int> FirstDataRow { get; set; }
        public string ColumnsToRead { get; set; }
        public string OriginalFileName { get; set; }
        public string ProcessingStatus { get; set; }
        public string FileType { get; set; }
        public Nullable<int> CodePage { get; set; }
        public string Messages { get; set; }
        public byte[] Contents { get; set; }
    }
}