"use client";

import React, { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";

const SubnetsTextEditor: React.FC = () => {
    const [text, setText] = useState("");

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
                Subnet Notes
            </Typography>
            <TextField
                label="Notes or Description"
                placeholder="Write your notes here..."
                multiline
                rows={20}
                fullWidth
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
        </Box>
    );
};

export default SubnetsTextEditor;
