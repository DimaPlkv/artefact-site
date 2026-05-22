#!/bin/bash
# Конвертация HEIC → JPEG для папки экспоната
# Использование: ./process-photos.sh <папка-с-HEIC> <slug-экспоната>
# Пример:    ./process-photos.sh ~/Desktop/vzv oktyabrsky-vzvoz
#
# Результат сохраняется в photos/<slug>/ (папка создаётся автоматически)

set -e

SRC="$1"
SLUG="$2"

if [ -z "$SRC" ] || [ -z "$SLUG" ]; then
  echo "Использование: $0 <папка-с-HEIC> <slug>"
  echo "Пример:        $0 ~/Desktop/vzv oktyabrsky-vzvoz"
  exit 1
fi

DEST="$(dirname "$0")/photos/$SLUG"
mkdir -p "$DEST"

COUNT=0
for f in "$SRC"/*.HEIC "$SRC"/*.heic "$SRC"/*.jpg "$SRC"/*.JPG "$SRC"/*.jpeg "$SRC"/*.png; do
  [ -f "$f" ] || continue
  NAME=$(basename "${f%.*}").jpg
  echo "  → $NAME"
  sips -s format jpeg -s formatOptions 75 -Z 1600 "$f" --out "$DEST/$NAME" > /dev/null 2>&1
  COUNT=$((COUNT + 1))
done

echo ""
echo "Готово: $COUNT файлов в $DEST"
