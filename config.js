/* ============================================================
   SAEP Analytics — Configuração de Cursos
   ============================================================
   Este arquivo é o fallback de configuração. Para atualizar
   as métricas anualmente sem editar código, use a opção
   "Atualizar Config" no sistema e importe o template Excel.

   A configuração importada via Excel tem prioridade sobre
   este arquivo e fica salva no navegador até nova importação.
============================================================ */

const SAEP_CONFIG = {

    cores: {
        verde:    '#22c55e',
        azul:     '#3b82f6',
        amarelo:  '#eab308',
        vermelho: '#ef4444'
    },

    cursos: {

        automacao: {
            nome: 'Técnico em Automação Industrial',
            escala: { abaixo: 450, basico: 550, adequado: 750 },
            capacidades: {
                C1: 'Instrumentação industrial',
                C2: 'Acionamento de sistemas automatizados',
                C3: 'Medição de variáveis físicas',
                C4: 'Lógica de controle e acionamento',
                C5: 'Estratégias de controle de processos',
                C6: 'Projetos e manutenção de automação',
                C7: 'Supervisão e comunicação de dados'
            },
            diagnosticos: {
                C1: 'Reforçar leitura de simbologia ISA e estratégias de medição de grandezas físicas em instrumentação industrial.',
                C2: 'Aprofundar elaboração de diagramas pneumáticos, hidráulicos e circuitos eletroeletrônicos para acionamento de motores.',
                C3: 'Consolidar técnicas de medição de pressão, temperatura, nível, vazão e variáveis analíticas com calibração de transmissores.',
                C4: 'Fortalecer programação de CLP, sensores digitais, microcontroladores e lógicas de intertravamento em processos industriais.',
                C5: 'Desenvolver especificação de elementos finais de controle e estratégias PID para controle contínuo de variáveis de processo.',
                C6: 'Ampliar interpretação de projetos, comissionamento e manutenção preventiva/preditiva de sistemas de controle e automação.',
                C7: 'Consolidar tratamento, supervisão e comunicação de dados entre dispositivos via redes industriais e banco de dados.'
            }
        },

        eletromecanica: {
            nome: 'Técnico em Eletromecânica',
            escala: { abaixo: 400, basico: 500, adequado: 650 },
            capacidades: {
                C1: 'Fundamentos de eletricidade',
                C2: 'Fundamentos de mecânica',
                C3: 'Interpretação de projetos técnicos',
                C4: 'Montagem e manutenção eletromecânica',
                C5: 'Manutenção de sistemas elétricos',
                C6: 'Diagnóstico e manutenção mecânica',
                C7: 'Sistemas automatizados e CLP',
                C8: 'Desenvolvimento de projetos eletromecânicos',
                C9: 'Planejamento e controle da manutenção'
            },
            diagnosticos: {
                C1: 'Reforçar fundamentos de eletricidade: circuitos, eletrotécnica, dispositivos de proteção e leitura de diagramas elétricos.',
                C2: 'Consolidar fundamentos de mecânica: metrologia, instrumentos de medição, tolerâncias dimensionais e controle de qualidade.',
                C3: 'Aprofundar leitura e interpretação de desenho técnico, documentação de projeto e organização do processo produtivo.',
                C4: 'Desenvolver procedimentos de montagem e manutenção eletromecânica com uso correto de ferramentas e normas técnicas.',
                C5: 'Fortalecer diagnóstico e manutenção de sistemas elétricos industriais, diagramas multifilares e dispositivos de proteção.',
                C6: 'Ampliar análise e diagnóstico de manutenção mecânica: rolamentos, lubrificação, alinhamento e identificação de falhas.',
                C7: 'Consolidar programação de CLP em Ladder, interpretação de sistemas automatizados e diagnóstico de falhas em ciclos operacionais.',
                C8: 'Desenvolver projetos eletromecânicos com software dedicado, usinagem, automação eletropneumática e eletro-hidráulica.',
                C9: 'Reforçar planejamento e controle da manutenção: PCM, gestão de ordens de serviço, NR-10 e indicadores de desempenho.'
            }
        },

        eletrotecnica: {
            nome: 'Técnico em Eletrotécnica',
            escala: { abaixo: 350, basico: 500, adequado: 650 },
            capacidades: {
                C1: 'Fundamentos de eletricidade e eletrônica',
                C2: 'Projetos elétricos e desenho técnico',
                C3: 'Dimensionamento e cálculos elétricos',
                C4: 'Manutenção de sistemas elétricos',
                C5: 'Instrumentos de medição elétrica',
                C6: 'Automação e acionamentos elétricos',
                C7: 'Programação e parametrização de automação',
                C8: 'Especificação de componentes e projetos',
                C9: 'Segurança e normas regulamentadoras',
                C10: 'Aterramento e proteção elétrica'
            },
            diagnosticos: {
                C1: 'Reforçar fundamentos de eletricidade, Lei de Ohm, circuitos CC/CA, eletrônica digital e motores elétricos.',
                C2: 'Consolidar aplicação de simbologias, CAD, normas de desenho técnico e leitura de diagramas elétricos.',
                C3: 'Aprofundar cálculos de dimensionamento de correntes, condutores, fator de potência e iluminação.',
                C4: 'Desenvolver técnicas de manutenção corretiva e preventiva em circuitos elétricos prediais e industriais.',
                C5: 'Fortalecer uso de multímetro, amperímetro, fasímetro e detector de tensão em medições elétricas.',
                C6: 'Ampliar identificação de componentes de automação: CLPs, inversores, válvulas e acionamentos eletroeletrônicos.',
                C7: 'Consolidar programação Ladder em CLP e parametrização de conversores de frequência para automação.',
                C8: 'Desenvolver especificação de condutores, disjuntores, relés e equipamentos de proteção conforme normas.',
                C9: 'Reforçar interpretação e aplicação das normas NR10, IEEE C37.2 e SPDA para segurança elétrica.',
                C10: 'Consolidar técnicas de aterramento conforme NBR 5419, NBR 5410 e procedimentos de desenergização.'
            }
        },

        mecanica: {
            nome: 'Técnico em Mecânica',
            escala: { abaixo: 400, basico: 500, adequado: 650 },
            capacidades: {
                C1: 'Interpretação técnica e manutenção',
                C2: 'Planejamento e processos de fabricação',
                C3: 'Seleção de procedimentos técnicos',
                C4: 'Execução e controle de processos mecânicos',
                C5: 'Análise de parâmetros técnicos',
                C6: 'Melhoria de processos e CNC/CAM',
                C7: 'Gestão da qualidade e manufatura enxuta'
            },
            diagnosticos: {
                C1: 'Aprofundar interpretação de dados técnicos, PCM, metrologia e documentação de manutenção.',
                C2: 'Reforçar planejamento de processos de fabricação: conformação, soldagem, usinagem e tecnologia dos materiais.',
                C3: 'Desenvolver seleção de procedimentos técnicos de fabricação, manutenção e elementos de máquinas.',
                C4: 'Consolidar execução e controle técnico: metrologia, soldagem, manufatura enxuta e segurança.',
                C5: 'Ampliar análise de parâmetros físicos, dimensionais, operacionais e automação aplicada.',
                C6: 'Fortalecer proposição de melhorias com CAD, CNC/CAM, ensaios não destrutivos e tecnologia dos materiais.',
                C7: 'Reforçar ferramentas de gestão da qualidade, manufatura enxuta, análise de falhas e indicadores de manutenção.'
            }
        },

        mecatronica: {
            nome: 'Técnico em Mecatrônica',
            escala: { abaixo: 400, basico: 500, adequado: 650 },
            capacidades: {
                C1: 'Instrumentos de medição',
                C2: 'Projetos mecânicos 3D',
                C3: 'Diagramas eletropneumáticos e hidráulicos',
                C4: 'Acionamentos elétricos',
                C5: 'Sistemas microcontrolados',
                C6: 'Especificação de sistemas automatizados',
                C7: 'Programação industrial e robótica',
                C8: 'Redes e comunicação industrial',
                C9: 'Manutenção industrial'
            },
            diagnosticos: {
                C1: 'Refinar o uso de instrumentos de medição mecânicos e eletroeletrônicos: paquímetro, multímetro e transistores.',
                C2: 'Consolidar modelagem 3D, leitura de projetos e usinagem convencional para produção de protótipos mecânicos.',
                C3: 'Reforçar interpretação de diagramas eletropneumáticos e eletro-hidráulicos com válvulas, sensores e relés.',
                C4: 'Aprofundar acionamentos elétricos: inversores de frequência, partidas convencionais e diagramas NR12.',
                C5: 'Fortalecer algoritmos, microcontroladores (PIC/C), circuitos digitais e sistemas eletrônicos microcontrolados.',
                C6: 'Revisar arquitetura de CLP, sensores digitais/analógicos, rolamentos e elementos de máquinas em automação.',
                C7: 'Ampliar programação CLP em Ladder, CNC (código G/M), robótica industrial e expressões booleanas.',
                C8: 'Desenvolver redes industriais (RS485, Ethernet/IP), SCADA e aquisição de dados em sistemas supervisórios.',
                C9: 'Consolidar fundamentos de PCM, tipos de manutenção e técnicas de inspeção em linhas de manufatura.'
            }
        }

    }

};
