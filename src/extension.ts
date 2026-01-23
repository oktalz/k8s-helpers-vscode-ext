import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let reusableDocument: vscode.TextDocument | undefined;

async function displayOutput(content: string, outputType: string | undefined) {
    if (outputType === 'newTab') {
        const document = await vscode.workspace.openTextDocument({ content: content, language: 'yaml' });
        await vscode.window.showTextDocument(document);
    } else if (outputType === 'tab') {
        if (!reusableDocument || reusableDocument.isClosed) {
            reusableDocument = await vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:k8s-helpers'));
            vscode.languages.setTextDocumentLanguage(reusableDocument, 'yaml');
        }

        try {
            const editor = await vscode.window.showTextDocument(reusableDocument, { preview: false });
            const fullRange = new vscode.Range(
                reusableDocument.positionAt(0),
                reusableDocument.positionAt(reusableDocument.getText().length)
            );
            await editor.edit(editBuilder => {
                editBuilder.replace(fullRange, content);
            });
        } catch (e) {
            reusableDocument = await vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:k8s-helpers'));
            vscode.languages.setTextDocumentLanguage(reusableDocument, 'yaml');
            const editor = await vscode.window.showTextDocument(reusableDocument, { preview: false });
            const fullRange = new vscode.Range(
                reusableDocument.positionAt(0),
                reusableDocument.positionAt(reusableDocument.getText().length)
            );
            await editor.edit(editBuilder => {
                editBuilder.replace(fullRange, content);
            });
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const disposables = [
        vscode.commands.registerCommand('k8s-helpers-ext.apply', (uri: vscode.Uri) => {
            executeKubectlCommand('apply', uri);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.delete', (uri: vscode.Uri) => {
            executeKubectlCommand('delete', uri);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.describe', (uri: vscode.Uri) => {
            executeKubectlCommand('describe', uri);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.get', (uri: vscode.Uri) => {
            executeKubectlCommand('get', uri);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.diff', (uri: vscode.Uri) => {
            executeKubectlCommand('diff', uri);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.setContext', () => {
            setPermanentContext();
        }),
		vscode.commands.registerCommand('k8s-helpers-ext.getCurrentContext', () => {
            getCurrentContext();
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getCurrentNamespace', () => {
            getCurrentNamespace();
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.setNamespace', () => {
            setNamespace();
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.createNamespace', () => {
            createNamespace();
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getPods', () => {
            executeKubectlGetCommand('pods');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getPodsAll', () => {
            executeKubectlGetCommand('pods', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getServices', () => {
            executeKubectlGetCommand('services');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getIngresses', () => {
            executeKubectlGetCommand('ingresses');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGatewayClasses', () => {
            executeKubectlGetCommand('gatewayclasses');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGateways', () => {
            executeKubectlGetCommand('gateways');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getHTTPRoutes', () => {
            executeKubectlGetCommand('httproutes');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getServicesAll', () => {
            executeKubectlGetCommand('services', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getIngressesAll', () => {
            executeKubectlGetCommand('ingresses', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGatewayClassesAll', () => {
            executeKubectlGetCommand('gatewayclasses', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGatewaysAll', () => {
            executeKubectlGetCommand('gateways', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getHTTPRoutesAll', () => {
            executeKubectlGetCommand('httproutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getDeployments', () => {
            executeKubectlGetCommand('deployments');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getDeploymentsAll', () => {
            executeKubectlGetCommand('deployments', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getStatefulSets', () => {
            executeKubectlGetCommand('statefulsets');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getStatefulSetsAll', () => {
            executeKubectlGetCommand('statefulsets', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getDaemonSets', () => {
            executeKubectlGetCommand('daemonsets');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getDaemonSetsAll', () => {
            executeKubectlGetCommand('daemonsets', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getReplicaSets', () => {
            executeKubectlGetCommand('replicasets');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getReplicaSetsAll', () => {
            executeKubectlGetCommand('replicasets', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getJobs', () => {
            executeKubectlGetCommand('jobs');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getJobsAll', () => {
            executeKubectlGetCommand('jobs', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getCronJobs', () => {
            executeKubectlGetCommand('cronjobs');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getCronJobsAll', () => {
            executeKubectlGetCommand('cronjobs', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getCRDs', () => {
            executeKubectlGetCommand('crds');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGRPCRoutes', () => {
            executeKubectlGetCommand('grpcroutes');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGRPCRoutesAll', () => {
            executeKubectlGetCommand('grpcroutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getTLSRoutes', () => {
            executeKubectlGetCommand('tlsroutes');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getTLSRoutesAll', () => {
            executeKubectlGetCommand('tlsroutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getTCPRoutes', () => {
            executeKubectlGetCommand('tcproutes');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getTCPRoutesAll', () => {
            executeKubectlGetCommand('tcproutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getUDPRoutes', () => {
            executeKubectlGetCommand('udproutes');
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getUDPRoutesAll', () => {
            executeKubectlGetCommand('udproutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getPodsAll-menu', () => {
            executeKubectlGetCommand('pods', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getServicesAll-menu', () => {
            executeKubectlGetCommand('services', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getIngressesAll-menu', () => {
            executeKubectlGetCommand('ingresses', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGatewayClassesAll-menu', () => {
            executeKubectlGetCommand('gatewayclasses', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGatewaysAll-menu', () => {
            executeKubectlGetCommand('gateways', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getHTTPRoutesAll-menu', () => {
            executeKubectlGetCommand('httproutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getDeploymentsAll-menu', () => {
            executeKubectlGetCommand('deployments', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getStatefulSetsAll-menu', () => {
            executeKubectlGetCommand('statefulsets', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getDaemonSetsAll-menu', () => {
            executeKubectlGetCommand('daemonsets', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getReplicaSetsAll-menu', () => {
            executeKubectlGetCommand('replicasets', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getJobsAll-menu', () => {
            executeKubectlGetCommand('jobs', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getCronJobsAll-menu', () => {
            executeKubectlGetCommand('cronjobs', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getGRPCRoutesAll-menu', () => {
            executeKubectlGetCommand('grpcroutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getTLSRoutesAll-menu', () => {
            executeKubectlGetCommand('tlsroutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getTCPRoutesAll-menu', () => {
            executeKubectlGetCommand('tcproutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getUDPRoutesAll-menu', () => {
            executeKubectlGetCommand('udproutes', true);
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.setKubeconfig', () => {
            setKubeconfig();
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.getResource', () => {
            getResource();
        }),
        vscode.commands.registerCommand('k8s-helpers-ext.clearKubeconfig', () => {
            clearKubeconfig();
        })
    ];

    context.subscriptions.push(...disposables);
}

function executeKubectlCommand(command: string, uri: vscode.Uri | undefined, context?: string) {
    const config = vscode.workspace.getConfiguration('k8s-helpers-ext');
    const outputType = config.get('outputType');

    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    const kubeconfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    const kubeconfigEnv = kubeconfig ? `KUBECONFIG=${kubeconfig}` : '';

    let filePath: string;

    if (uri) {
        filePath = uri.fsPath;
    } else if (vscode.window.activeTextEditor) {
        filePath = vscode.window.activeTextEditor.document.uri.fsPath;
    } else {
        vscode.window.showErrorMessage('No file is open or selected.');
        return;
    }

    const contextFlag = context ? `--context ${context}` : '';
    let outputYaml = '';
    if (command === "get") {
        outputYaml = "-o yaml";
    }
    const kubectlCommand = `${kubeconfigEnv} kubectl ${command} -f "${filePath}" ${contextFlag} ${outputYaml}`;

    const showOutput = command !== 'apply' && command !== 'delete';

    exec(kubectlCommand, async (error: (Error & { code?: number }) | null, stdout: string, stderr: string) => {
        if (outputType === 'tab' || outputType === 'newTab') {
            if (command === 'diff' && error && error.code === 1) {
                const output = `Differences found:\n${stdout}\nerr:\n${stderr}`;
                await displayOutput(output, outputType);
                vscode.window.showInformationMessage('kubectl diff found differences.');
                return;
            }

            if (error) {
                const output = `Error: ${error.message}\nerr: ${stderr}`;
                await displayOutput(output, outputType);
                vscode.window.showErrorMessage(`Failed to execute kubectl ${command}. See output for details.`);
                return;
            }

            if (showOutput) {
                const output = `# ${kubectlCommand}\n\n${stderr}\n\n${stdout}`;
                await displayOutput(output, outputType);
            }
        } else {
            const outputChannel = vscode.window.createOutputChannel('k8s-helpers-ext');
            if (showOutput) {
                outputChannel.show();
                outputChannel.appendLine(`# ${kubectlCommand}`);
            }

            if (command === 'diff' && error && error.code === 1) {
                outputChannel.show();
                outputChannel.appendLine(`Differences found:\n${stdout}`);
                if (stderr) {
                    outputChannel.appendLine(`err:\n${stderr}`);
                }
                vscode.window.showInformationMessage('kubectl diff found differences.');
                return;
            }

            if (error) {
                outputChannel.show();
                outputChannel.appendLine(`Error: ${error.message}`);
                if (stderr) {
                    outputChannel.appendLine(`err: ${stderr}`);
                }
                vscode.window.showErrorMessage(`Failed to execute kubectl ${command}. See output for details.`);
                return;
            }

            if (showOutput) {
                if (stderr) {
                    outputChannel.appendLine(`err: ${stderr}`);
                }
                outputChannel.appendLine(`${stdout}`);
            }
        }
        vscode.window.showInformationMessage(`Successfully executed kubectl ${command}.`);
    });
}

function setPermanentContext() {
    const kubeDir = path.join(os.homedir(), '.kube');
    if (!fs.existsSync(kubeDir)) {
        vscode.window.showErrorMessage('No .kube directory found.');
        return;
    }

    const files = fs.readdirSync(kubeDir);
    const configs = files.filter(file => file === 'config' || file.endsWith('.config'));

    const contextPromises = configs.map(config => {
        return new Promise<string[]>((resolve, reject) => {
            const configPath = path.join(kubeDir, config);
            exec(`kubectl config get-contexts -o name --kubeconfig="${configPath}"`, (error, stdout, stderr) => {
                if (error) {
                    resolve([]);
                    return;
                }
                const contexts = stdout.split('\n').filter(line => line.length > 0).map(context => `${config}-${context}`);
                resolve(contexts);
            });
        });
    });

    Promise.all(contextPromises).then(results => {
        const allContexts = results.flat();
        vscode.window.showQuickPick(allContexts).then(selected => {
            if (selected) {
                const parts = selected.split('-');
                const config = parts[0];
                const context = parts.slice(1).join('-');
                const configPath = path.join(kubeDir, config);

                const helperDir = path.join(os.homedir(), '.k8s-helper');
                if (!fs.existsSync(helperDir)) {
                    fs.mkdirSync(helperDir);
                }
                fs.writeFileSync(path.join(helperDir, '.env'), configPath);

                exec(`kubectl config use-context "${context}" --kubeconfig="${configPath}"`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Failed to set context to ${context}.`);
                        return;
                    }
                    vscode.window.showInformationMessage(`Switched to context "${context}" in ${config}.`);
                });
            }
        });
    });
}

function getCurrentContext() {
    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    const kubeconfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    const kubeconfigEnv = kubeconfig ? `KUBECONFIG=${kubeconfig}` : '';

    exec(`${kubeconfigEnv} kubectl config current-context`, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Failed to get current kubectl context.');
            return;
        }
        vscode.window.showInformationMessage(`Current context: ${stdout}`);
    });
}

function getCurrentNamespace() {
    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    const kubeconfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    const kubeconfigEnv = kubeconfig ? `KUBECONFIG=${kubeconfig}` : '';

    exec(`${kubeconfigEnv} kubectl config view --minify --output "jsonpath={..namespace}"`, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Failed to get current namespace.');
            return;
        }
        vscode.window.showInformationMessage(`Current namespace: ${stdout || 'default'}`);
    });
}

function setNamespace() {
    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    const kubeconfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    const kubeconfigEnv = kubeconfig ? `KUBECONFIG=${kubeconfig}` : '';

    exec(`${kubeconfigEnv} kubectl get namespace -o name`, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Failed to get namespaces.');
            return;
        }

        const excludedNamespaces = [
            'kube-node-lease',
            'kube-public',
            'kube-system',
            'local-path-storage'
        ];

        const namespaces = stdout.split('\n')
            .filter(line => line.length > 0)
            .map(line => line.replace('namespace/', ''))
            .filter(ns => !excludedNamespaces.includes(ns));
            
        vscode.window.showQuickPick(namespaces, { placeHolder: 'Select a namespace to set' }).then(selectedNamespace => {
            if (selectedNamespace) {
                exec(`${kubeconfigEnv} kubectl config set-context --current --namespace=${selectedNamespace}`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Failed to set namespace to ${selectedNamespace}.`);
                        return;
                    }
                    vscode.window.showInformationMessage(`Namespace set to "${selectedNamespace}".`);
                });
            }
        });
    });
}

function createNamespace() {
    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    const kubeconfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    const kubeconfigEnv = kubeconfig ? `KUBECONFIG=${kubeconfig}` : '';

    vscode.window.showInputBox({ prompt: 'Enter the name for the new namespace' }).then(namespaceName => {
        if (namespaceName) {
            exec(`${kubeconfigEnv} kubectl create namespace ${namespaceName}`, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to create namespace "${namespaceName}": ${stderr || error.message}`);
                    return;
                }
                
                exec(`${kubeconfigEnv} kubectl config set-context --current --namespace=${namespaceName}`, (setError, setStdout, setStderr) => {
                    if (setError) {
                        vscode.window.showWarningMessage(`Namespace "${namespaceName}" created, but failed to set it as current: ${setStderr || setError.message}`);
                        return;
                    }
                    vscode.window.showInformationMessage(`Namespace "${namespaceName}" created and set as current.`);
                });
            });
        }
    });
}

function executeKubectlGetCommand(resource: string, allNamespaces: boolean = false) {
    const config = vscode.workspace.getConfiguration('k8s-helpers-ext');
    const outputType = config.get('outputType');

    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    const kubeconfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    const kubeconfigEnv = kubeconfig ? `KUBECONFIG=${kubeconfig}` : '';

    const allNamespacesFlag = allNamespaces ? '-A' : '';
    const kubectlCommand = `${kubeconfigEnv} kubectl get ${resource} ${allNamespacesFlag}`;

    exec(kubectlCommand, async (error: (Error & { code?: number }) | null, stdout: string, stderr: string) => {
        if (outputType === 'tab' || outputType === 'newTab') {
            if (error) {
                const output = `Error: ${error.message}\nerr: ${stderr}`;
                await displayOutput(output, outputType);
                vscode.window.showErrorMessage(`Failed to execute kubectl get ${resource}. See output for details.`);
                return;
            }

            const output = `# ${kubectlCommand}\n\n${stderr}\n\n${stdout}`;
            await displayOutput(output, outputType);
        } else {
            const outputChannel = vscode.window.createOutputChannel('k8s-helpers-ext');
            outputChannel.show();
            outputChannel.appendLine(`# ${kubectlCommand}`);

            if (error) {
                outputChannel.appendLine(`Error: ${error.message}`);
                if (stderr) {
                    outputChannel.appendLine(`err: ${stderr}`);
                }
                vscode.window.showErrorMessage(`Failed to execute kubectl get ${resource}. See output for details.`);
                return;
            }

            if (stderr) {
                outputChannel.appendLine(`err: ${stderr}`);
            }
            outputChannel.appendLine(`${stdout}`);
        }
        vscode.window.showInformationMessage(`Successfully executed kubectl get ${resource}.`);
    });
}

function setKubeconfig() {
    const kubeDir = path.join(os.homedir(), '.kube');
    if (!fs.existsSync(kubeDir)) {
        vscode.window.showErrorMessage('No .kube directory found.');
        return;
    }

    const files = fs.readdirSync(kubeDir);
    const configs = files.filter(file => file === 'config' || file.endsWith('.config'));

    vscode.window.showQuickPick(configs).then(selectedConfig => {
        if (selectedConfig) {
            if (selectedConfig === 'config') {
                clearKubeconfig();
                return;
            }
            
            const helperDir = path.join(os.homedir(), '.k8s-helper');
            if (!fs.existsSync(helperDir)) {
                fs.mkdirSync(helperDir);
            }
            fs.writeFileSync(path.join(helperDir, '.env'), path.join(kubeDir, selectedConfig));
            vscode.window.showInformationMessage(`KUBECONFIG set to ${selectedConfig}`);
        }
    });
}

function getResource() {
    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    const kubeconfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    const kubeconfigEnv = kubeconfig ? `KUBECONFIG=${kubeconfig}` : '';

    exec(`${kubeconfigEnv} kubectl get namespace -o name`, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Failed to get namespaces.');
            return;
        }

        const excludedNamespaces = [
            'kube-node-lease',
            'kube-public',
            'kube-system',
            'local-path-storage'
        ];

        const namespaces = stdout.split('\n')
            .filter(line => line.length > 0)
            .map(line => line.replace('namespace/', ''))
            .filter(ns => !excludedNamespaces.includes(ns));

        vscode.window.showQuickPick(namespaces, { placeHolder: 'Select a namespace' }).then(selectedNamespace => {
            if (selectedNamespace) {
                exec(`${kubeconfigEnv} kubectl api-resources --verbs=list --namespaced=true -o name`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage('Failed to get resource types.');
                        return;
                    }

                    const resourceTypes = stdout.split('\n').filter(line => line.length > 0);

                    const promises = resourceTypes.map(resourceType => {
                        return new Promise<string | null>((resolve) => {
                            exec(`${kubeconfigEnv} kubectl get ${resourceType} -n ${selectedNamespace} -o name`, (error, stdout, stderr) => {
                                if (error || stdout.trim().length === 0) {
                                    resolve(null);
                                } else {
                                    resolve(resourceType);
                                }
                            });
                        });
                    });

                    Promise.all(promises).then(results => {
                        const availableResourceTypes = results.filter((r): r is string => r !== null);

                        if (availableResourceTypes.length === 0) {
                            vscode.window.showInformationMessage(`No resources found in namespace ${selectedNamespace}.`);
                            return;
                        }

                        vscode.window.showQuickPick(availableResourceTypes, { placeHolder: 'Select a resource type' }).then(selectedResourceType => {
                            if (selectedResourceType) {
                                exec(`${kubeconfigEnv} kubectl get ${selectedResourceType} -n ${selectedNamespace} -o name`, (error, stdout, stderr) => {
                                    if (error) {
                                        vscode.window.showErrorMessage(`Failed to get resources of type ${selectedResourceType}.`);
                                        return;
                                    }

                                    const resources = stdout.split('\n').filter(line => line.length > 0);
                                    vscode.window.showQuickPick(resources, { placeHolder: 'Select a resource' }).then(selectedResource => {
                                        if (selectedResource) {
                                            const config = vscode.workspace.getConfiguration('k8s-helpers-ext');
                                            const outputType = config.get('outputType');

                                            const kubectlCommand = `${kubeconfigEnv} kubectl get ${selectedResource} -n ${selectedNamespace} -o yaml`;
                                            exec(kubectlCommand, async (error, stdout, stderr) => {
                                                if (outputType === 'tab' || outputType === 'newTab') {
                                                    if (error) {
                                                        const output = `Error: ${error.message}\nerr: ${stderr}`;
                                                        await displayOutput(output, outputType);
                                                        vscode.window.showErrorMessage(`Failed to get resource ${selectedResource}. See output for details.`);
                                                        return;
                                                    }
                                                    const output = `# ${kubectlCommand}\n\n${stderr}\n\n${stdout}`;
                                                    await displayOutput(output, outputType);
                                                } else {
                                                    const outputChannel = vscode.window.createOutputChannel('k8s-helpers-ext');
                                                    outputChannel.show();
                                                    outputChannel.appendLine(`# ${kubectlCommand}`);

                                                    if (error) {
                                                        outputChannel.appendLine(`Error: ${error.message}`);
                                                        if (stderr) {
                                                            outputChannel.appendLine(`err: ${stderr}`);
                                                        }
                                                        vscode.window.showErrorMessage(`Failed to get resource ${selectedResource}. See output for details.`);
                                                        return;
                                                    }

                                                    if (stderr) {
                                                        outputChannel.appendLine(`err: ${stderr}`);
                                                    }
                                                    outputChannel.appendLine(`${stdout}`);
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }
        });
    });
}

function clearKubeconfig() {
    const envPath = path.join(os.homedir(), '.k8s-helper', '.env');
    if (fs.existsSync(envPath)) {
        fs.unlinkSync(envPath);
        vscode.window.showInformationMessage('KUBECONFIG environment file cleared.');
    } else {
        vscode.window.showInformationMessage('No KUBECONFIG environment file to clear.');
    }
}

export function deactivate() {}
