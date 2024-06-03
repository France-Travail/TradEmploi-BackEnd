#!bash

curl -X POST 'https://api.deepl.com/v2/glossaries' \
--header 'Authorization: DeepL-Auth-Key YOUR-TOKEN-HERE' \
--header 'Content-Type: application/json' \
--data '{
    "name": "DEEPL_GLOSSARY_FR_EN",
    "source_lang": "fr",
    "target_lang": "en",
    "entries_format": "tsv",
    "entries": "Phrase spécifique qui sera traduite\tSpecific sentence to translate in the desired language\n"
}'
