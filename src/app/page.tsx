'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    Box,
    IconButton,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Stack,
} from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'

// Custom color palette - easy to edit
const customColors = {
    primary: '#1976d2',      // Blue
    secondary: '#dc004e',    // Pink
    error: '#d32f2f',        // Red
    background: '#ffffff',   // White
    surface: '#f5f5f5',      // Light gray
    textPrimary: '#000000',  // Black
    textSecondary: '#666666', // Gray
}

const customDarkColors = {
    primary: '#90caf9',      // Light blue
    secondary: '#f48fb1',    // Light pink
    error: '#f87171',        // Light red
    background: '#121212',   // Dark gray
    surface: '#1e1e1e',      // Darker gray
    textPrimary: '#ffffff',  // White
    textSecondary: '#cccccc', // Light gray
}

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: customColors.primary,
        },
        secondary: {
            main: customColors.secondary,
        },
        error: {
            main: customColors.error,
        },
        background: {
            default: customColors.background,
            paper: customColors.surface,
        },
        text: {
            primary: customColors.textPrimary,
            secondary: customColors.textSecondary,
        },
    },
})

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: customDarkColors.primary,
        },
        secondary: {
            main: customDarkColors.secondary,
        },
        error: {
            main: customDarkColors.error,
        },
        background: {
            default: customDarkColors.background,
            paper: customDarkColors.surface,
        },
        text: {
            primary: customDarkColors.textPrimary,
            secondary: customDarkColors.textSecondary,
        },
    },
})

interface Archetype {
    archetypeName: string
    url?: string
    [key: string]: string | boolean | undefined
}

export default function Home() {
    const [data, setData] = useState<Archetype[]>([])
    const [filteredData, setFilteredData] = useState<Archetype[]>([])
    const [filters, setFilters] = useState<Record<string, null | boolean>>({})
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        Papa.parse('/data.csv', {
            download: true,
            header: true,
            complete: (results) => {
                const parsedData = results.data as Archetype[]
                setData(parsedData)
                setFilteredData(parsedData)
                // Initialize filters
                const skillHeaders = Object.keys(parsedData[0] || {}).filter(
                    (key) => key !== 'archetypeName' && key !== 'url'
                )
                const initialFilters: Record<string, null | boolean> = {}
                skillHeaders.forEach((skill) => {
                    initialFilters[skill] = null
                })
                setFilters(initialFilters)
            },
        })
    }, [])

    useEffect(() => {
        const filtered = data.filter((item) => {
            return Object.keys(filters).every((key) => {
                const state = filters[key]
                if (state === null) return true
                if (state === true) return item[key] === 'TRUE'
                return item[key] !== 'TRUE'
            })
        })
        setFilteredData(filtered)
    }, [data, filters])

    const handleFilterClick = (skill: string) => {
        setFilters((prev) => {
            const current = prev[skill]
            const next = current === null ? true : current === true ? false : null
            return { ...prev, [skill]: next }
        })
    }

    const clearFilters = () => {
        setFilters((prev) => {
            const cleared: Record<string, null> = {}
            Object.keys(prev).forEach((key) => {
                cleared[key] = null
            })
            return cleared
        })
    }

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }

    const camelToTitle = (camel: string) => {
        return camel.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
    }

    return (
        <ThemeProvider theme={darkMode ? darkTheme : theme}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        PF2e Archetype Finder
                    </Typography>
                    <IconButton color="inherit" onClick={toggleDarkMode}>
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Skill Filters
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Click a chip to include, exclude, or reset a skill.
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {Object.keys(filters).map((skill) => (
                            <Chip
                                key={skill}
                                label={camelToTitle(skill)}
                                onClick={() => handleFilterClick(skill)}
                                color={
                                    filters[skill] === true
                                        ? 'primary'
                                        : filters[skill] === false
                                            ? 'error'
                                            : 'default'
                                }
                                variant={filters[skill] === null ? 'outlined' : 'filled'}
                            />
                        ))}
                    </Stack>
                    <Button variant="contained" onClick={clearFilters} sx={{ mt: 2 }}>
                        Clear Filters
                    </Button>
                </Box>
                <Grid container spacing={3}>
                    {filteredData.length === 0 ? (
                        <Grid item xs={12}>
                            <Typography variant="h6" align="center">
                                No archetypes match the current skill filters.
                            </Typography>
                        </Grid>
                    ) : (
                        filteredData.map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {item.archetypeName}
                                        </Typography>
                                        {item.url && (
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                    View Details
                                                </a>
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {Object.keys(item).map((key) => {
                                                if (key !== 'archetypeName' && key !== 'url' && item[key] === 'TRUE') {
                                                    return (
                                                        <Chip
                                                            key={key}
                                                            label={camelToTitle(key)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )
                                                }
                                                return null
                                            })}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </ThemeProvider>
    )
}