$adminDir = "C:\Users\Administrateur\Desktop\site weeb e-commers\client\src\pages\admin"

$files = Get-ChildItem -Path "$adminDir\Admin*.jsx"

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $original = $content

    # Order matters: specific patterns first, then generic replacements

    # 7. Specific gradient patterns (do before moris->clay)
    $content = $content -replace 'bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50', 'bg-white'
    
    # 8. bg-gradient-to-br from-moris-500 to-orange-500 -> bg-clay-500
    $content = $content -replace 'bg-gradient-to-br from-moris-500 to-orange-500', 'bg-clay-500'

    # Handle card.color template variable - replace with solid bg
    $content = $content -replace '\$\{card\.color\}', 'bg-clay-500'
    
    # Handle bg-gradient-to-r from-moris-500 to-orange-500
    $content = $content -replace 'bg-gradient-to-r from-moris-500 to-orange-500', 'bg-clay-500'
    
    # Handle bg-gradient-to-b from-moris-500 to-orange-500 (accent bars)
    $content = $content -replace 'bg-gradient-to-b from-moris-500 to-orange-500', 'bg-clay-500'
    
    # Handle bg-gradient-to-br from-purple-500 to-violet-500
    $content = $content -replace 'bg-gradient-to-br from-purple-500 to-violet-500', 'bg-purple-500'
    
    # Handle card color definitions
    $content = $content -replace 'from-blue-500 to-blue-600', 'bg-blue-500'
    $content = $content -replace 'from-green-500 to-emerald-600', 'bg-green-500'
    $content = $content -replace 'from-purple-500 to-violet-600', 'bg-purple-500'
    $content = $content -replace 'from-moris-500 to-orange-500', 'bg-clay-500'

    # 6. Remove text-gradient class
    $content = $content -replace '\btext-gradient\b', ''
    $content = $content -replace '  +', ' '
    
    # 9. Remaining bg-gradient-to-*
    $content = $content -replace 'bg-gradient-to-\w+\s+', ''
    
    # 40, 41. Remove gradient direction classes that may remain
    $content = $content -replace ' from-[a-z]+-[0-9]+', ''
    $content = $content -replace ' via-[a-z]+-[0-9]+', ''
    $content = $content -replace ' to-[a-z]+-[0-9]+', ''
    
    # 1. moris- -> clay-
    $content = $content -replace 'moris-', 'clay-'
    
    # 2-5. dark-* -> ink-*
    $content = $content -replace 'dark-800', 'ink-800'
    $content = $content -replace 'dark-700', 'ink-700'
    $content = $content -replace 'dark-900', 'ink-900'
    $content = $content -replace 'dark-950', 'ink-950'
    
    # 16. card-solid -> card
    $content = $content -replace 'card-solid', 'card'
    
    # 17. input-field -> input
    $content = $content -replace 'input-field', 'input'
    
    # 18. section-title -> section-heading
    $content = $content -replace 'section-title', 'section-heading'
    
    # 19. bg-white/50 -> bg-white
    $content = $content -replace 'bg-white/50', 'bg-white'
    
    # 20-21. bg-gray-* -> bg-ink-*
    $content = $content -replace 'bg-gray-50', 'bg-ink-50'
    $content = $content -replace 'bg-gray-100', 'bg-ink-50'
    
    # 22-28. text-gray-* -> text-ink-*
    $content = $content -replace 'text-gray-500', 'text-ink-500'
    $content = $content -replace 'text-gray-600', 'text-ink-600'
    $content = $content -replace 'text-gray-700', 'text-ink-700'
    $content = $content -replace 'text-gray-400', 'text-ink-400'
    $content = $content -replace 'text-gray-800', 'text-ink-800'
    $content = $content -replace 'text-gray-300', 'text-ink-300'
    $content = $content -replace 'text-gray-200', 'text-ink-200'
    
    # 29-32. border-gray-* -> border-ink-*
    $content = $content -replace 'border-gray-200', 'border-ink-200'
    $content = $content -replace 'border-gray-700', 'border-ink-700'
    $content = $content -replace 'border-gray-300', 'border-ink-300'
    $content = $content -replace 'border-gray-100', 'border-ink-100'
    
    # 10-12. rounded-* -> rounded
    $content = $content -replace 'rounded-2xl', 'rounded'
    $content = $content -replace 'rounded-3xl', 'rounded'
    $content = $content -replace 'rounded-xl', 'rounded'
    
    # 13-15. shadow-* -> shadow-*
    $content = $content -replace 'shadow-2xl', 'shadow-md'
    $content = $content -replace 'shadow-xl', 'shadow-md'
    $content = $content -replace 'shadow-lg', 'shadow-sm'
    
    # 33. Remove emoji characters
    $emojiList = @(
        [char]0xD83D + [char]0xDC35   # 🐵 - actually doesn't appear
    )
    # Remove specific emoji strings that appear in the files
    $content = $content -replace '📰', ''
    $content = $content -replace '🎉', ''
    $content = $content -replace '⭐', ''
    $content = $content -replace '←', ''
    $content = $content -replace '→', ''
    $content = $content -replace '🛒', ''
    $content = $content -replace '🔥', ''
    $content = $content -replace '✅', ''
    $content = $content -replace '❌', ''
    $content = $content -replace '✨', ''
    $content = $content -replace '👥', ''
    $content = $content -replace '📦', ''
    $content = $content -replace '📋', ''
    $content = $content -replace '💰', ''
    $content = $content -replace '🔐', ''
    $content = $content -replace '🏷️', ''
    $content = $content -replace '🎫', ''
    $content = $content -replace '📝', ''
    $content = $content -replace '↩️', ''
    $content = $content -replace '🎁', ''
    $content = $content -replace '📊', ''
    $content = $content -replace '💾', ''
    $content = $content -replace '💬', ''
    $content = $content -replace '🚚', ''
    $content = $content -replace '📧', ''
    $content = $content -replace '📄', ''
    $content = $content -replace '⚙️', ''
    $content = $content -replace '✏️', ''
    $content = $content -replace '🗑️', ''
    $content = $content -replace '🛡️', ''
    $content = $content -replace '👤', ''
    $content = $content -replace '📥', ''
    $content = $content -replace '📂', ''
    
    # 34. Remove hover:shadow-lg, hover:shadow-xl
    $content = $content -replace 'hover:shadow-lg', ''
    $content = $content -replace 'hover:shadow-xl', ''
    
    # 35. Remove hover:-translate-y-1
    $content = $content -replace 'hover:-translate-y-1', ''
    
    # 36. hover:bg-gray-100 -> hover:bg-ink-50
    $content = $content -replace 'hover:bg-gray-100', 'hover:bg-ink-50'
    
    # 37. hover:bg-gray-200 -> hover:bg-ink-100
    $content = $content -replace 'hover:bg-gray-200', 'hover:bg-ink-100'
    
    # 38. hover:bg-white -> hover:bg-ink-50
    $content = $content -replace 'hover:bg-white', 'hover:bg-ink-50'
    
    # 39. Remove glass, glass-card, backdrop-blur-*
    $content = $content -replace '\bglass\b', ''
    $content = $content -replace '\bglass-card\b', ''
    $content = $content -replace 'backdrop-blur-\w+', ''
    
    # 42. border-white/20 -> border-ink-200
    $content = $content -replace 'border-white/20', 'border-ink-200'
    
    # Clean up whitespace
    $content = $content -replace '  +', ' '
    $content = $content -replace '\s+\n', "`n"
    $content = $content -replace '\n\s+\n', "`n`n"
    
    if ($content -ne $original) {
        Set-Content -LiteralPath $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    } else {
        Write-Host "No changes: $($file.Name)"
    }
}
