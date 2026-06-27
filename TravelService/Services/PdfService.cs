using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Net.Http.Json;
using TravelService.Data;
using TravelService.DTOs;

namespace TravelService.Services
{
    public class PdfService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public PdfService(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<byte[]?> GeneratePlanPdfAsync(int planId, int userId, string role)
        {
            var plan = role == "admin"
                ? await _context.TravelPlans
                    .Include(p => p.Destinations)
                    .Include(p => p.Activities)
                    .FirstOrDefaultAsync(p => p.Id == planId)
                : await _context.TravelPlans
                    .Include(p => p.Destinations)
                    .Include(p => p.Activities)
                    .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

            if (plan == null) return null;

            var expenses = await GetExpensesAsync(planId);
            var checklist = await GetChecklistAsync(planId);
            var totalSpent = expenses.Sum(e => e.Amount);

            QuestPDF.Settings.License = LicenseType.Community;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                    page.Header().Element(ComposeHeader(plan.Title, plan.StartDate, plan.EndDate));
                    page.Content().Element(ComposeContent(plan, expenses, checklist, totalSpent));
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Stranica ");
                        text.CurrentPageNumber();
                        text.Span(" od ");
                        text.TotalPages();
                    });
                });
            });

            return pdf.GeneratePdf();
        }

        private static Action<IContainer> ComposeHeader(string title, DateTime start, DateTime end)
        {
            return container =>
            {
                container.Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(inner =>
                        {
                            inner.Item().Text(title ?? "").FontSize(20).Bold();
                            inner.Item().Text($"{start:dd.MM.yyyy} — {end:dd.MM.yyyy}")
                                .FontSize(12).FontColor(Colors.Grey.Medium);
                        });
                    });

                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                });
            };
        }

        private static Action<IContainer> ComposeContent(
            Models.TravelPlan plan,
            List<ExpenseItemDto> expenses,
            List<ChecklistItemDto> checklist,
            decimal totalSpent)
        {
            return container =>
            {
                container.PaddingTop(16).Column(col =>
                {
                    col.Item().Text("Osnovni podaci").FontSize(14).Bold();
                    col.Item().PaddingTop(6).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1);
                            c.RelativeColumn(2);
                        });

                        AddTableRow(table, "Budžet", $"{plan.Budget:N2} €");
                        AddTableRow(table, "Potrošeno", $"{totalSpent:N2} €");
                        AddTableRow(table, "Preostalo", $"{plan.Budget - totalSpent:N2} €");

                        if (!string.IsNullOrWhiteSpace(plan.Description))
                            AddTableRow(table, "Opis", plan.Description);

                        if (!string.IsNullOrWhiteSpace(plan.Notes))
                            AddTableRow(table, "Napomene", plan.Notes);
                    });

                    if (plan.Destinations.Any())
                    {
                        col.Item().PaddingTop(20).Text("Destinacije").FontSize(14).Bold();
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Naziv").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Lokacija").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Dolazak").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Odlazak").Bold();
                            });

                            foreach (var d in plan.Destinations.OrderBy(d => d.ArrivalDate))
                            {
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(d.Name ?? "");
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(d.Location ?? "");
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(d.ArrivalDate.ToString("dd.MM.yyyy"));
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(d.DepartureDate.ToString("dd.MM.yyyy"));
                            }
                        });
                    }

                    if (plan.Activities.Any())
                    {
                        col.Item().PaddingTop(20).Text("Aktivnosti").FontSize(14).Bold();
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                                c.RelativeColumn(2);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Naziv").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Datum").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Vrijeme").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Lokacija").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Trošak").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Status").Bold();
                            });

                            foreach (var a in plan.Activities.OrderBy(a => a.Date).ThenBy(a => a.Time))
                            {
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(a.Name ?? "");
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(a.Date.ToString("dd.MM.yyyy"));
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                    .Text(a.Time == default ? "" : a.Time.ToString(@"hh\:mm"));
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(a.Location ?? "");
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text($"{a.EstimatedCost:N2} €");
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(a.Status ?? "");
                            }
                        });
                    }

                 
                    if (expenses.Any())
                    {
                        col.Item().PaddingTop(20).Text("Troškovi").FontSize(14).Bold();
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Naziv").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Kategorija").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Datum").Bold();
                                h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Iznos").Bold();
                            });

                            foreach (var e in expenses.OrderBy(e => e.Date))
                            {
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(e.Name ?? "");
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(e.Category ?? "");
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(e.Date.ToString("dd.MM.yyyy"));
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text($"{e.Amount:N2} €");
                            }

                            table.Cell().ColumnSpan(3).Padding(4).AlignRight().Text("Ukupno:").Bold();
                            table.Cell().Padding(4).Text($"{totalSpent:N2} €").Bold();
                        });
                    }

                    if (checklist.Any())
                    {
                        col.Item().PaddingTop(20).Text("Checklist").FontSize(14).Bold();
                        col.Item().PaddingTop(6).Column(checkCol =>
                        {
                            foreach (var item in checklist)
                            {
                                var symbol = item.IsCompleted ? "☑" : "☐";
                                checkCol.Item().Text($"{symbol}  {item.Name ?? ""}").FontSize(11);
                            }
                        });
                    }
                });
            };
        }

        private static void AddTableRow(TableDescriptor table, string label, string value)
        {
            table.Cell().Padding(4).Text(label ?? "").Bold();
            table.Cell().Padding(4).Text(value ?? "");
        }

        private async Task<List<ExpenseItemDto>> GetExpensesAsync(int planId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("ExpenseService");
                var result = await client.GetFromJsonAsync<List<ExpenseItemDto>>(
                    $"api/travel-plans/{planId}/expenses");
                return result ?? new List<ExpenseItemDto>();
            }
            catch
            {
                return new List<ExpenseItemDto>();
            }
        }

        private async Task<List<ChecklistItemDto>> GetChecklistAsync(int planId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("ChecklistService");
                var result = await client.GetFromJsonAsync<List<ChecklistItemDto>>(
                    $"api/travel-plans/{planId}/checklist");
                return result ?? new List<ChecklistItemDto>();
            }
            catch
            {
                return new List<ChecklistItemDto>();
            }
        }
    }
}