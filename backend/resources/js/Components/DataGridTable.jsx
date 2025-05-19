// resources/js/Components/DataGridWrapper.jsx

import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export default function DataGridTable({ rows, columns, checkboxSelection = false, onRowClick }) {
    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                    },
                }}
                autoHeight
                pageSizeOptions={[10, 25, 50, 100, { value: -1, label: 'All' }]}
                checkboxSelection={checkboxSelection}
                disableRowSelectionOnClick
                onRowClick={onRowClick}
            />
        </Box>
    );
}