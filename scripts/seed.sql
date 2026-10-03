-- Seed de exemplo para o LeadFlow CRM
-- Leads com datas relativas (sempre cobrem os últimos 6 meses)

DELETE FROM leads;

INSERT INTO leads (name, company, email, phone, source, value, status, notes, created_at, updated_at) VALUES
-- Compraram (receita distribuída nos últimos 6 meses)
('Marina Duarte', 'Clínica Sorriso Pleno', 'marina@sorrisopleno.com.br', '(11) 98412-3345', 'Google Ads', 18500.00, 'purchased', 'Fechou pacote anual de gestão de tráfego.', now() - interval '168 days', now() - interval '160 days'),
('Rafael Costa', 'Imobiliária Horizonte', 'rafael@imobhorizonte.com.br', '(21) 99755-8821', 'Indicação', 32000.00, 'purchased', 'Contrato de captação de leads para lançamentos.', now() - interval '151 days', now() - interval '140 days'),
('Fernanda Lima', 'Academia Prime Fit', 'fernanda@primefit.com.br', '(31) 98877-2041', 'Instagram', 9800.00, 'purchased', 'Plano trimestral de leads para matrículas.', now() - interval '122 days', now() - interval '115 days'),
('João Pedro Alves', 'Advocacia Rios & Prado', 'joao@riosprado.adv.br', '(41) 99123-6677', 'Site', 24000.00, 'purchased', 'Campanha para área trabalhista.', now() - interval '104 days', now() - interval '96 days'),
('Camila Rocha', 'Loja Bella Moda', 'camila@bellamoda.com.br', '(85) 98654-1209', 'Facebook Ads', 7200.00, 'purchased', 'Leads para coleção de inverno.', now() - interval '88 days', now() - interval '80 days'),
('Thiago Nogueira', 'Construtora Alicerce', 'thiago@alicerce.eng.br', '(51) 99988-4432', 'LinkedIn', 45000.00, 'purchased', 'Projeto enterprise de qualificação de leads.', now() - interval '63 days', now() - interval '55 days'),
('Beatriz Martins', 'Padaria Pão Dourado', 'bia@paodourado.com.br', '(11) 97654-9087', 'WhatsApp', 4500.00, 'purchased', 'Campanha local de encomendas.', now() - interval '40 days', now() - interval '33 days'),
('Lucas Ferreira', 'TechNova Soluções', 'lucas@technova.io', '(48) 99100-2233', 'Site', 27000.00, 'purchased', 'Outbound B2B para SaaS contábil.', now() - interval '22 days', now() - interval '14 days'),
('Patrícia Gomes', 'DentalCare Odonto', 'patricia@dentalcare.com.br', '(61) 98822-7766', 'Google Ads', 15800.00, 'purchased', 'Renovação + upgrade do plano.', now() - interval '12 days', now() - interval '5 days'),
-- Pendentes (pipeline ativo)
('André Barbosa', 'Transportadora Rota Sul', 'andre@rotasul.com.br', '(47) 99911-3355', 'Indicação', 21000.00, 'pending', 'Pediu proposta revisada. Retorno na sexta.', now() - interval '3 days', now() - interval '3 days'),
('Juliana Castro', 'Escola Futuro Brilhante', 'juliana@futurobrilhante.com.br', '(71) 98765-1199', 'Instagram', 12500.00, 'pending', 'Interessada em leads para matrículas do próximo semestre.', now() - interval '5 days', now() - interval '1 days'),
('Felipe Duarte', 'Café Sabor & Arte', 'felipe@saborearte.cafe', '(31) 97432-5566', 'Site', 6800.00, 'pending', null, now() - interval '7 days', now() - interval '7 days'),
('Larissa Melo', 'PetShop Amigo Fiel', 'larissa@amigofiel.pet', '(81) 99876-3344', 'WhatsApp', 5400.00, 'pending', 'Aguardando decisão do sócio.', now() - interval '9 days', now() - interval '2 days'),
('Gustavo Henrique', 'Studio Ink Tattoo', 'gustavo@studioink.art', '(11) 96655-7788', 'Instagram', 8900.00, 'pending', 'Quer focar em clientes de fechamento de braço.', now() - interval '12 days', now() - interval '4 days'),
('Renata Souza', 'AgroCampo Insumos', 'renata@agrocampo.com.br', '(64) 99933-2211', 'LinkedIn', 36000.00, 'pending', 'Negociação em fase de contrato.', now() - interval '16 days', now() - interval '3 days'),
('Diego Santos', 'Autoescola Direção Certa', 'diego@direcaocerta.com.br', '(91) 98544-6677', 'Google Ads', 11200.00, 'pending', null, now() - interval '20 days', now() - interval '20 days'),
('Vanessa Ribeiro', 'Espaço Viver Bem Estética', 'vanessa@viverbem.com.br', '(27) 99766-8899', 'Facebook Ads', 7900.00, 'pending', 'Enviado portfólio de cases.', now() - interval '24 days', now() - interval '10 days'),
('Bruno Carvalho', 'Oficina TurboMax', 'bruno@turbomax.com.br', '(19) 98811-4455', 'Site', 13600.00, 'pending', 'Follow-up agendado para amanhã.', now() - interval '28 days', now() - interval '6 days'),
-- Recusados
('Carlos Eduardo', 'Farmácia Saúde Total', 'carlos@saudetotal.com.br', '(62) 98777-1122', 'Google Ads', 15400.00, 'refused', 'Optou por agência interna.', now() - interval '145 days', now() - interval '130 days'),
('Aline Freitas', 'Ótica Visão Clara', 'aline@visaoclara.com.br', '(84) 99654-7788', 'Instagram', 6200.00, 'refused', 'Preço acima do orçamento.', now() - interval '118 days', now() - interval '110 days'),
('Rodrigo Azevedo', 'Pizzaria Forno Vivo', 'rodrigo@fornovivo.com.br', '(41) 98833-9900', 'WhatsApp', 4800.00, 'refused', 'Não respondeu após 3 follow-ups.', now() - interval '95 days', now() - interval '85 days'),
('Tatiane Lopes', 'Consultoria Empreenda Já', 'tati@empreendaja.com.br', '(11) 97788-5544', 'LinkedIn', 19800.00, 'refused', 'Fechou com concorrente.', now() - interval '70 days', now() - interval '60 days'),
('Igor Mendonça', 'Lavacar Espelho D''Água', 'igor@espelhodagua.com.br', '(35) 99922-1166', 'Site', 3900.00, 'refused', 'Sem budget no momento.', now() - interval '45 days', now() - interval '38 days'),
('Sabrina Nunes', 'Floricultura Encanto', 'sabrina@encantoflores.com.br', '(51) 98677-3322', 'Facebook Ads', 5600.00, 'refused', 'Cancelou expansão da loja.', now() - interval '32 days', now() - interval '25 days'),
('Eduardo Pires', 'Gráfica Imprime Aí', 'eduardo@imprimeai.com.br', '(21) 99811-7744', 'Indicação', 8900.00, 'refused', 'Preferiu reavaliar no próximo trimestre.', now() - interval '15 days', now() - interval '8 days');
