import * as vscode from 'vscode';
import { exec } from 'child_process';

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
        })
    ];

    context.subscriptions.push(...disposables);
}

function executeKubectlCommand(command: string, uri: vscode.Uri | undefined, context?: string) {
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
    const kubectlCommand = `kubectl ${command} -f "${filePath}" ${contextFlag}`;

    const outputChannel = vscode.window.createOutputChannel('k8s-helpers-ext');
    const showOutput = command !== 'apply' && command !== 'delete';

    if (showOutput) {
        outputChannel.show();
        outputChannel.appendLine(`# ${kubectlCommand}`);
    }

    exec(kubectlCommand, (error: (Error & { code?: number }) | null, stdout: string, stderr: string) => {
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
        vscode.window.showInformationMessage(`Successfully executed kubectl ${command}.`);
    });
}

function setPermanentContext() {
    exec('kubectl config get-contexts -o name', (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Failed to get kubectl contexts.');
            return;
        }

        const contexts = stdout.split('\n').filter(line => line.length > 0);
        vscode.window.showQuickPick(contexts).then(selectedContext => {
            if (selectedContext) {
                exec(`kubectl config use-context ${selectedContext}`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Failed to set context to ${selectedContext}.`);
                        return;
                    }
                    vscode.window.showInformationMessage(`Switched to context "${selectedContext}".`);
                });
            }
        });
    });
}

function getCurrentContext() {
    exec('kubectl config current-context', (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Failed to get current kubectl context.');
            return;
        }
        vscode.window.showInformationMessage(`Current context: ${stdout}`);
    });
}

function getCurrentNamespace() {
    exec('kubectl config view --minify --output "jsonpath={..namespace}"', (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Failed to get current namespace.');
            return;
        }
        vscode.window.showInformationMessage(`Current namespace: ${stdout || 'default'}`);
    });
}

function setNamespace() {
    exec('kubectl get namespace -o name', (error, stdout, stderr) => {
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
                exec(`kubectl config set-context --current --namespace=${selectedNamespace}`, (error, stdout, stderr) => {
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
    vscode.window.showInputBox({ prompt: 'Enter the name for the new namespace' }).then(namespaceName => {
        if (namespaceName) {
            exec(`kubectl create namespace ${namespaceName}`, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to create namespace "${namespaceName}": ${stderr || error.message}`);
                    return;
                }
                
                exec(`kubectl config set-context --current --namespace=${namespaceName}`, (setError, setStdout, setStderr) => {
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
    const allNamespacesFlag = allNamespaces ? '-A' : '';
    const kubectlCommand = `kubectl get ${resource} ${allNamespacesFlag}`;

    const outputChannel = vscode.window.createOutputChannel('k8s-helpers-ext');
    outputChannel.show();
    outputChannel.appendLine(`# ${kubectlCommand}`);

    exec(kubectlCommand, (error: (Error & { code?: number }) | null, stdout: string, stderr: string) => {
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
        vscode.window.showInformationMessage(`Successfully executed kubectl get ${resource}.`);
    });
}

export function deactivate() {}
