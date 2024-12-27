<script lang="ts">
    import { parse } from 'csv-parse/browser/esm/sync';

    const newTableKey = '!KEY';

    let inputFiles: FileList | null = null;

    let transformedObject: any = null;

    function generateJson(data: string) {
        const table: string[][] = parse(data);

        console.log(table);

        const startPoints: {
            rowStartIndex: number;
            columnIndex: number;
        }[] = [];

        for (let rowIndex = 0; rowIndex < table.length; rowIndex++) {
            const row = table[rowIndex];
            for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
                if (row[columnIndex] === newTableKey) {
                    startPoints.push({
                        rowStartIndex: rowIndex,
                        columnIndex,
                    });
                }
            }
        }

        const values: {
            key: string;
            value: string;
            valueType: string;
        }[] = [];

        for (let i = 0; i < startPoints.length; i++) {
            const startPoint = startPoints[i];
            const valuesColumnIndex = startPoint.columnIndex + 1;
            const valueType = table[startPoint.rowStartIndex][valuesColumnIndex].split(':')[1];

            for (let rowIndex = startPoint.rowStartIndex + 1; rowIndex < table.length; rowIndex++) {
                const row = table[rowIndex];

                const key = row[startPoint.columnIndex];
                let value = row[valuesColumnIndex];

                if (key == newTableKey || key == '' || value == '') {
                    break;
                }

                if (key.startsWith('!')) {
                    continue;
                }

                let cellValueType = valueType;

                if (value.startsWith('!')) {
                    const parts = value.split(':');
                    cellValueType = parts[0].slice(1);
                    value = value.slice(parts[0].length + 1);
                }

                if (cellValueType == 'NUMBER') {
                    value = value.replaceAll(' ', '').replaceAll(' ', '');
                }

                console.log(key);

                values.push({
                    key,
                    value,
                    valueType: cellValueType,
                });
            }
        }

        const newTransformedObject: any = {
            parameters: {},
        };

        values.forEach((item) => {
            newTransformedObject.parameters[item.key] = {
                defaultValue: {
                    value: item.value,
                },
                valueType: item.valueType,
            };
        });

        transformedObject = newTransformedObject;

        console.log(JSON.stringify(newTransformedObject));
    }

    function readAndGenerateJson(files: FileList | null) {
        if (files && files[0]) {
            let file = files[0];
            let reader = new FileReader();
            reader.onload = function (evt) {
                if (evt.target) {
                    generateJson(evt.target.result as string);
                }
            };
            reader.readAsText(file);
        }
    }

    $: readAndGenerateJson(inputFiles);

    // @ts-ignore
    let hash = __COMMIT_HASH__;

    // @ts-ignore
    let version = __VERSION__;
</script>

<svelte:head>
    <title>csv2frc</title>
</svelte:head>

<h1>csv2frc v{version}</h1>
<h4>git commit: {hash}</h4>
<main>
    <input bind:files={inputFiles} type="file" id="file" name="csvFile" accept=".csv" required />
    {#if transformedObject != null}
        <div class="result">
            Done, {Object.keys(transformedObject.parameters).length} parameters
            <br />
            <a
                href={URL.createObjectURL(new Blob([JSON.stringify(transformedObject)], { type: 'json' }))}
                download="csv2frc-result.json"
            >
                <button>Download .json</button>
            </a>
        </div>
    {/if}
</main>

<style>
    .result {
        margin-top: 1em;
    }
</style>
